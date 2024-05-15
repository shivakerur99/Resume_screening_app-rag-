import io
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException, File, UploadFile
from pdfminer.high_level import extract_text
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String
from databases import Database

from langchain.chains.question_answering import load_qa_chain
from langchain_community.llms import HuggingFaceEndpoint
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import CharacterTextSplitter
from langchain.docstore.document import Document as LangchainDocument
import replicate

import os
os.environ['REPLICATE_API_TOKEN'] = "r8_GV1rWUgBdo8XUCpJPFTb4OqnJBzEQmB1LaRqx"


app = FastAPI()



# Set up CORS for allowing requests from all origins
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Define SQLAlchemy engine and metadata
DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(DATABASE_URL)
metadata = MetaData()

# Define the document table schema
documents = Table(
    "documents",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("filename", String),
    Column("upload_date", String),
    Column("content", String),
)

# Create the document table in the database
metadata.create_all(engine)

# Define Pydantic model for the document
class Document(BaseModel):
    filename: str
    upload_date: str
    content: str

# Function to save uploaded files
async def save_uploaded_file(file: UploadFile, destination: str):
    with open(destination, "wb") as buffer:
        while chunk := await file.read(1024):
            buffer.write(chunk)

# Endpoint for uploading PDF files
@app.post("/upload/")
async def upload_pdf(file: UploadFile = File(...)):

    # Check if the uploaded file is a PDF
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")
    
    # Read content of the uploaded PDF file
    content = await file.read()
    
    # Extract text from the PDF
    with io.BytesIO(content) as pdf_file:
        text_content = extract_text(pdf_file)
    
    # Create a document object
    doc = Document(filename=file.filename, upload_date=str(datetime.now()), content=text_content)
    
    # Insert the document data into the database
    async with Database(DATABASE_URL) as database:
        query = documents.insert().values(
            filename=doc.filename,
            upload_date=doc.upload_date,
            content=doc.content
        )
        last_record_id = await database.execute(query)
    
    # Save the uploaded PDF file
    destination = f"files/{file.filename}"
    await save_uploaded_file(file, destination)
    
    # Return the document object
    return doc

# Pydantic model for input data
class DataInput(BaseModel):
    responseData: str
    userInput: str

# Function to call the Replicate API for the LLaMA model
def call_replicate_llama(prompt):
    input = {
        "top_p": 1,
        "prompt": prompt,
        "temperature": 0.75,
        "system_prompt": ("based on contest provided by user resume you can answer,content that is passing towards you is candidate resume you can judge is his skill and ask questions relvent to that topic"),
        "max_new_tokens": 800,
        "repetition_penalty": 1
    }
    output = replicate.run(
        "meta/llama-2-7b-chat",
        input=input
    )
    return "".join(output)

# Endpoint for processing user data
@app.post("/doc/")
async def process_data(data: DataInput):
    # Access responseData and userInput
    response_data = data.responseData
    user_input = data.userInput
    
    # Load required models and components from Langchain library
    dom = [LangchainDocument(page_content=response_data, metadata={"source": "local"})]

    text_splitter = CharacterTextSplitter(chunk_size=3000, chunk_overlap=0)
    docs = text_splitter.split_documents(dom)

    embeddings = HuggingFaceEmbeddings()
    db = FAISS.from_documents(docs, embeddings)

    # Perform similarity search
    dm = db.similarity_search(user_input)
    context = "\n".join([d.page_content for d in dm])

    # Use the Replicate API to get the response from the LLaMA model
    result = call_replicate_llama(f"Context: {context}\nQuestion: {user_input}")

    return result

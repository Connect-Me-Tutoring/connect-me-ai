from google import genai
from google.genai import types
import os
from groq import Groq, AsyncGroq
import json
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from typing import Union
# import asgi
# from workers import WorkerEntryPoint


app = FastAPI()
load_dotenv()

# class Default(workerEntrypoint):
#     async def fetch(self, request):
#         return await asgi.fetch(app, request, self.env)

#Open data
with open('./data/handbook.json', 'r') as file:
    handbook_data = json.load(file)
with open('./data/tutorresources.json', 'r') as file:
    tutor_resources_data = json.load(file)
with open('./data/Connect-Me-Handbook.md') as file:
    handbook_data_s6 = file
with open('./data/Connect-Me-Tutor-Portal-Manual.md') as file:
    tutor_portal_manual = file
with open('./data/Tutor-FAQs-Connect-Me.md') as file:
    tutor_faq = file

client = genai.Client()

class Item(BaseModel):
    message : str


@app.post("/process-message")
async def read_item(message: Item):
    try:
        response = await call_gemini(message.message)
        return response
    except Exception as e:
        print("Read Item Exception")
        raise HTTPException(status_code = 500, detail = f"Error in processing query {e}")


# @cached(ttl = 3600)
async def call_gemini(query : str) -> str:
    
    system_instructions = (
        f'''
        {handbook_data_s6} {tutor_portal_manual} {tutor_faq} Your are a helpful assistant answering questions based off the data given
        Provide as many links as possible. Always provide the CONNECT_ME_HANDBOOK link if necessary to answer the prompt.
        Keep the response under 2000 characters. RESPOND EMPTY IF THE QUESTION IS NOT RELEVANT TO THE PROVIDED RESOURCES
        '''
    )
    
    try:
        response = await client.aio.models.generate_content(
            model="gemini-2.5-flash",
            config=types.GenerateContentConfig(
                system_instruction=system_instructions),
            contents = f"{query}"
        )
        
        return response.text
    except Exception as e:
        print("GEMINI EXCEPTION")
        raise HTTPException(status_code = 500, detail = f"Error in Gemini call {e}")
    
    
async def stream_generator(response: any):
    async for chunk in response:
        if chunk.text:
            yield chunk.text
            
            
async def call_gemini_streaming(query: str, system_instructions: str):
    try:
        response = await client.aio.models.generate_content_stream(
            model="gemini-2.5-flash",
            config=types.GenerateContentConfig(
                system_instruction=system_instructions),
            contents = f"{query}"
        )
        
        return StreamingResponse(stream_generator, media_type="text/plain")
    except Exception as e:
        print("GEMINI EXCEPTION")
        raise HTTPException(status_code = 500, detail = f"Error in Gemini call {e}")
    
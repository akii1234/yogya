#!/usr/bin/env python3
"""
Simple WebSocket Test for Video Call
"""

import asyncio
import websockets
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Store connected clients
clients = {}

async def handle_websocket(websocket, path):
    """Handle WebSocket connections"""
    client_id = None
    
    try:
        # Accept the connection
        await websocket.accept()
        logger.info(f"New WebSocket connection: {websocket.remote_address}")
        
        # Generate client ID
        client_id = f"client_{len(clients) + 1}"
        clients[client_id] = websocket
        
        logger.info(f"Client {client_id} connected. Total clients: {len(clients)}")
        
        # Send welcome message
        await websocket.send(json.dumps({
            "type": "welcome",
            "client_id": client_id,
            "message": "Connected to video call server"
        }))
        
        # Notify other clients
        for other_id, other_ws in clients.items():
            if other_id != client_id:
                try:
                    await other_ws.send(json.dumps({
                        "type": "user_joined",
                        "client_id": client_id,
                        "message": f"User {client_id} joined the room"
                    }))
                except:
                    pass
        
        # Listen for messages
        async for message in websocket:
            try:
                data = json.loads(message)
                logger.info(f"Received from {client_id}: {data}")
                
                # Broadcast to other clients
                for other_id, other_ws in clients.items():
                    if other_id != client_id:
                        try:
                            await other_ws.send(json.dumps({
                                "type": "message",
                                "from": client_id,
                                "data": data
                            }))
                        except:
                            pass
                            
            except json.JSONDecodeError:
                logger.error(f"Invalid JSON from {client_id}")
                
    except websockets.exceptions.ConnectionClosed:
        logger.info(f"Client {client_id} disconnected")
    except Exception as e:
        logger.error(f"Error handling client {client_id}: {e}")
    finally:
        if client_id and client_id in clients:
            del clients[client_id]
            logger.info(f"Client {client_id} removed. Total clients: {len(clients)}")
            
            # Notify other clients
            for other_id, other_ws in clients.items():
                try:
                    await other_ws.send(json.dumps({
                        "type": "user_left",
                        "client_id": client_id,
                        "message": f"User {client_id} left the room"
                    }))
                except:
                    pass

async def main():
    """Start the WebSocket server"""
    logger.info("Starting WebSocket server on ws://localhost:8002")
    
    server = await websockets.serve(
        handle_websocket,
        "localhost",
        8002
    )
    
    logger.info("WebSocket server started successfully!")
    logger.info("Test with: wscat -c ws://localhost:8002")
    
    await server.wait_closed()

if __name__ == "__main__":
    asyncio.run(main())

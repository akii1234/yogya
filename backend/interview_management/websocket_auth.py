from django.conf import settings
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from user_management.models import User
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        # Get token from query parameters
        query_string = scope.get('query_string', b'').decode()
        query_params = dict(param.split('=') for param in query_string.split('&') if '=' in param)
        token = query_params.get('token', None)
        
        if token:
            try:
                # Decode JWT token using simple_jwt
                access_token = AccessToken(token)
                user_id = access_token['user_id']
                
                if user_id:
                    # Get user from database
                    user = await self.get_user(user_id)
                    scope['user'] = user
                else:
                    scope['user'] = AnonymousUser()
            except (InvalidToken, TokenError):
                scope['user'] = AnonymousUser()
        else:
            scope['user'] = AnonymousUser()
        
        return await super().__call__(scope, receive, send)
    
    @database_sync_to_async
    def get_user(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return AnonymousUser()

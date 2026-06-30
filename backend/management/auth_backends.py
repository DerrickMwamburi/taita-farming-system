# backend/management/auth_backends.py
from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.db.models import Q

UserModel = get_user_model()

class EmailOrUsernameModelBackend(ModelBackend):
    """
    Allows a user to log in using either their username (for farmers using phone numbers) 
    or their email address (for County Admins).
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            # Check if the input matches a username OR an email
            user = UserModel.objects.get(Q(username__iexact=username) | Q(email__iexact=username))
        except UserModel.DoesNotExist:
            return None
            
        if user.check_password(password) and self.user_can_authenticate(user):
            return user
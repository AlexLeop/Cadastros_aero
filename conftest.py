import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from mixer.backend.django import mixer

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def user():
    return mixer.blend(User)

@pytest.fixture
def admin_user():
    return mixer.blend(User, is_staff=True, is_superuser=True)

@pytest.fixture
def auth_client(user):
    client = APIClient()
    refresh = RefreshToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return client, user

@pytest.fixture
def admin_client(admin_user):
    client = APIClient()
    refresh = RefreshToken.for_user(admin_user)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return client, admin_user

@pytest.fixture
def mock_celery(mocker):
    return mocker.patch('celery.app.task.Task.delay')

@pytest.fixture
def mock_s3(mocker):
    return mocker.patch('django.core.files.storage.default_storage.save') 
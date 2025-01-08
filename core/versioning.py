from rest_framework.versioning import URLPathVersioning
from rest_framework.settings import api_settings

class CustomVersioning(URLPathVersioning):
    default_version = '1'
    allowed_versions = ['1', '2']
    version_param = 'version'

    def determine_version(self, request, *args, **kwargs):
        version = super().determine_version(request, *args, **kwargs)
        if version not in self.allowed_versions:
            return self.default_version
        return version 
from drf_spectacular.utils import extend_schema
from rest_framework import serializers
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


class HealthCheckSerializer(serializers.Serializer):
    status = serializers.CharField(read_only=True)
    service = serializers.CharField(read_only=True)


class HealthCheckView(GenericAPIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    serializer_class = HealthCheckSerializer

    @extend_schema(responses=HealthCheckSerializer)
    def get(self, request):
        return Response({"status": "ok", "service": "streamcheck-api"})

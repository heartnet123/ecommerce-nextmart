from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

class AdminOnlyView(APIView):
    permission_classes = [IsAdminUser]
    def get(self, request):
        return Response({"message": "Hello Admin"})

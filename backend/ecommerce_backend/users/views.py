from django.shortcuts import render
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import UserSerializer
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth import logout

User = get_user_model()
class RegisterUser(APIView):
    """ลงทะเบียนผู้ใช้ใหม่"""
    permission_classes = [AllowAny]

    def post(self, request):
        print("Register request data:", request.data)  # Debug print
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = serializer.save()
                user.set_password(request.data['password'])
                user.save()
                refresh = RefreshToken.for_user(user)
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': serializer.data
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                print("Error creating user:", str(e))  # Debug print
                return Response({
                    'error': 'Could not create user',
                    'details': str(e)
                }, status=status.HTTP_400_BAD_REQUEST)
        print("Serializer errors:", serializer.errors)  # Debug print
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GetUserProfile(APIView):
    """เรียกดูข้อมูลผู้ใช้"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    

class LogoutUser(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({
            'message': 'User logged out successfully'
        })
        
class IsAdmin(APIView):
    """เช็คสถานะว่าเป็น Admin หรือไม่"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        return Response({
            'is_staff': request.user.is_staff
        }, status=status.HTTP_200_OK)

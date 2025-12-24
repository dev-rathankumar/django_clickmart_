from django.shortcuts import render, get_object_or_404
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import Cart, CartItem
from rest_framework.response import Response
from .serializers import CartSerializer, CartItemSerializer
from products.models import Product
from rest_framework import status



class CartView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        # get or create the cart for logged in user
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)
        

class AddToCartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # take the input
        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity') # 2

        if not product_id:
            return Response({'error': 'product_id is required'})
        
        # get the product
        product = get_object_or_404(Product, id=product_id, is_active=True)
        
        # get or create the cart
        cart, _ = Cart.objects.get_or_create(user=request.user)

        # get or create cartitem
        item, created = CartItem.objects.get_or_create(cart=cart, product=product)

        if not created: # cart item already exist
            # item.quantity = item.quantity + quantity
            item.quantity += int(quantity)
            item.save()
        
        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

class ManageCartItemView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, item_id):
        # validate
        if 'change' not in request.data:
            return Response({"error": "Provide 'change' field"})
        
        change = int(request.data.get('change')) # +1 or -1

        item = get_object_or_404(CartItem, pk=item_id, cart__user=request.user)
        product = item.product

        # for adding, check the stock
        if change > 0: # change = 1
            if item.quantity + change > product.stock:
                return Response({'error': 'Not enough stock'})
            
        new_qty = item.quantity + change # change can be +1 or -1

        if new_qty <= 0:
            # remove item from cart
            item.delete()
            return Response({'success': 'Item removed'})
        
        # save the new quantity
        item.quantity = new_qty
        item.save()
        serializer = CartItemSerializer(item)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    def delete(self, request, item_id):
        item = get_object_or_404(CartItem, pk=item_id, cart__user=request.user)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
            
        
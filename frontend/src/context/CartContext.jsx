import { createContext, useState, useContext, useEffect } from 'react'
import api from '../api'
import toast from 'react-hot-toast'

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  // Fetch cart on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetchCart()
    } else {
      // Load from localStorage for guest users
      const localCart = JSON.parse(localStorage.getItem('cart') || '{"items": []}')
      setCart(localCart)
      updateCartCount(localCart)
    }
  }, [])

  const updateCartCount = (cartData) => {
    const count = cartData?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
    setCartCount(count)
  }

  const fetchCart = async () => {
    try {
      setLoading(true)
      const res = await api.get('/cart')
      setCart(res.data.cart)
      updateCartCount(res.data.cart)
    } catch (error) {
      console.error('Fetch cart error:', error)
      // Fallback to localStorage
      const localCart = JSON.parse(localStorage.getItem('cart') || '{"items": []}')
      setCart(localCart)
      updateCartCount(localCart)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (productId, quantity = 1) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')

      if (token) {
        // Authenticated user - add to backend
        const res = await api.post('/cart/add', { productId, quantity })
        setCart(res.data.cart)
        updateCartCount(res.data.cart)
        toast.success('Added to cart!')
      } else {
        // Guest user - add to localStorage
        const localCart = JSON.parse(localStorage.getItem('cart') || '{"items": []}')
        const existingIndex = localCart.items.findIndex(item => item.productId === productId)
        
        if (existingIndex > -1) {
          localCart.items[existingIndex].quantity += quantity
        } else {
          localCart.items.push({ productId, quantity })
        }
        
        localStorage.setItem('cart', JSON.stringify(localCart))
        setCart(localCart)
        updateCartCount(localCart)
        toast.success('Added to cart!')
      }
    } catch (error) {
      console.error('Add to cart error:', error)
      toast.error(error.response?.data?.error || 'Failed to add to cart')
    } finally {
      setLoading(false)
    }
  }

  const updateCartItem = async (productId, quantity) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')

      if (token) {
        const res = await api.put('/cart/update', { productId, quantity })
        setCart(res.data.cart)
        updateCartCount(res.data.cart)
        toast.success('Cart updated')
      } else {
        const localCart = JSON.parse(localStorage.getItem('cart') || '{"items": []}')
        const itemIndex = localCart.items.findIndex(item => item.productId === productId)
        
        if (quantity === 0) {
          localCart.items.splice(itemIndex, 1)
        } else {
          localCart.items[itemIndex].quantity = quantity
        }
        
        localStorage.setItem('cart', JSON.stringify(localCart))
        setCart(localCart)
        updateCartCount(localCart)
        toast.success('Cart updated')
      }
    } catch (error) {
      console.error('Update cart error:', error)
      toast.error(error.response?.data?.error || 'Failed to update cart')
    } finally {
      setLoading(false)
    }
  }

  const removeFromCart = async (productId) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')

      if (token) {
        const res = await api.delete(`/cart/remove/${productId}`)
        setCart(res.data.cart)
        updateCartCount(res.data.cart)
        toast.success('Item removed from cart')
      } else {
        const localCart = JSON.parse(localStorage.getItem('cart') || '{"items": []}')
        localCart.items = localCart.items.filter(item => item.productId !== productId)
        localStorage.setItem('cart', JSON.stringify(localCart))
        setCart(localCart)
        updateCartCount(localCart)
        toast.success('Item removed from cart')
      }
    } catch (error) {
      console.error('Remove from cart error:', error)
      toast.error('Failed to remove item')
    } finally {
      setLoading(false)
    }
  }

  const clearCart = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')

      if (token) {
        await api.delete('/cart/clear')
      }
      
      localStorage.removeItem('cart')
      setCart({ items: [] })
      setCartCount(0)
      toast.success('Cart cleared')
    } catch (error) {
      console.error('Clear cart error:', error)
      toast.error('Failed to clear cart')
    } finally {
      setLoading(false)
    }
  }

  const value = {
    cart,
    cartCount,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    fetchCart
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
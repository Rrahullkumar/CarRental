import React, { useState, useRef, useEffect } from 'react'
import { Bot, X, Send, MessageCircle, User, Car, Calendar, BookOpen, List, HelpCircle } from 'lucide-react'
import { useAppContext } from '../context/AppContext'

const FloatingChatBot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! Welcome to our car rental service. How can I help you today?",
      sender: 'bot',
      showOptions: true
    }
  ])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  // Get axios from context - following your pattern
  const { axios } = useAppContext()

  // scroll whenever mesg changes
  useEffect(() => {
    scrollToBottom()
  }, [messages]) // Scroll whenever messages change

  // Add this function to scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const quickOptions = [
    { icon: Car, label: 'Browse Cars', action: 'browse_cars' },
    { icon: Calendar, label: 'Check Availability', action: 'check_availability' },
    { icon: BookOpen, label: 'My Bookings', action: 'my_bookings' },
    { icon: List, label: 'Rental Pricing', action: 'pricing' },
    { icon: HelpCircle, label: 'Help & Support', action: 'help' }
  ]


  // Function to fetch cars from API - following your pattern
  const fetchCarsForChat = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get('/api/user/cars')
      if (data.success) {
        // Format the cars data for display (max 10 cars)
        const carsToShow = data.cars.slice(0, 10)
        const formattedMessage = formatCarsResponse(carsToShow)
        return formattedMessage
      } else {
        return "Sorry, I couldn't fetch the car details at the moment."
      }
    } catch (error) {
      console.error(error)
      return "Sorry, something went wrong while fetching car details."
    } finally {
      setLoading(false)
    }
  }

  // Function to fetch only available cars from API
  const fetchAvailableCars = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get('/api/user/cars')
      if (data.success) {
        // Filter cars where isAvaliable is true (max 10 cars)
        const availableCars = data.cars.filter(car => car.isAvaliable === true).slice(0, 10)
        const formattedMessage = formatAvailableCarsResponse(availableCars)
        return formattedMessage
      } else {
        return "Sorry, I couldn't fetch the car details at the moment."
      }
    } catch (error) {
      console.error(error)
      return "Sorry, something went wrong while fetching car details."
    } finally {
      setLoading(false)
    }
  }

  // Function to format available cars data into readable message
  const formatAvailableCarsResponse = (cars) => {
    if (cars.length === 0) {
      return "Sorry, no cars are currently available for rent."
    }

    let response = `Great news! We have ${cars.length} available car${cars.length > 1 ? 's' : ''} right now:\n\n`

    cars.forEach((car, index) => {
      response += `${index + 1}. ${car.brand} ${car.model}\n`
      response += `   • Available: Yes ✓\n\n`
    })

    return response
  }


  // Function to format cars data into readable message
  const formatCarsResponse = (cars) => {
    if (cars.length === 0) {
      return "No cars are currently available."
    }

    let response = `Here are ${cars.length} available cars:\n\n`

    cars.forEach((car, index) => {
      response += `${index + 1}. ${car.brand} ${car.model}\n`
      response += `   • Seating: ${car.seating_capacity} people\n`
      response += `   • Transmission: ${car.transmission}\n\n`
    })

    return response
  }

  // Function to fetch user bookings from API
  const fetchUserBookings = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get('/api/bookings/user')
      if (data.success) {
        const bookingsToShow = data.bookings.slice(0, 10) // Max 10 bookings
        const formattedMessage = formatBookingsResponse(bookingsToShow)
        return formattedMessage
      } else {
        return "Sorry, I couldn't fetch your bookings at the moment."
      }
    } catch (error) {
      console.error(error)
      // Check if error is 401 (Unauthorized) - user not logged in
      if (error.response && error.response.status === 401) {
        return "🔒 Please login to view your bookings.\n\nYou need to be logged in to see your booking history."
      }
      return "Sorry, something went wrong while fetching your bookings."
    } finally {
      setLoading(false)
    }
  }

  // Function to format bookings data into readable message
  const formatBookingsResponse = (bookings) => {
    if (bookings.length === 0) {
      return "You don't have any bookings yet.\n\nBrowse our cars and make your first booking!"
    }

    let response = `You have ${bookings.length} booking${bookings.length > 1 ? 's' : ''}:\n\n`

    bookings.forEach((booking, index) => {
      // Format dates to readable format
      const pickupDate = new Date(booking.pickupDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
      const returnDate = new Date(booking.returnDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })

      response += `${index + 1}. ${booking.car.brand} ${booking.car.model}\n`
      response += `   • Pickup: ${pickupDate}\n`
      response += `   • Return: ${returnDate}\n`
      response += `   • Status: ${booking.status}\n`
      response += `   • Total: ₹${booking.price.toLocaleString()}\n\n`
    })

    return response
  }

  // Function to fetch rental pricing for top 5 latest cars
  const fetchRentalPricing = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get('/api/user/cars')
      if (data.success) {
        // Sort by createdAt date in descending order (latest first)
        const sortedCars = data.cars.sort((a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
        )
        // Get top 5 latest cars
        const latestCars = sortedCars.slice(0, 5)
        const formattedMessage = formatPricingResponse(latestCars)
        return formattedMessage
      } else {
        return "Sorry, I couldn't fetch the pricing details at the moment."
      }
    } catch (error) {
      console.error(error)
      return "Sorry, something went wrong while fetching pricing details."
    } finally {
      setLoading(false)
    }
  }

  // Function to format pricing data into readable message
  const formatPricingResponse = (cars) => {
    if (cars.length === 0) {
      return "No pricing information available at the moment."
    }

    let response = `Here are our latest rental prices:\n\n`

    cars.forEach((car, index) => {
      response += `${index + 1}. ${car.brand} ${car.model}\n`
      response += `   • ₹${car.pricePerDay.toLocaleString()}/day\n\n`
    })

    return response
  }

  // Function to return help and support information
  const getHelpAndSupport = () => {
    return `📍 Contact Us\n\n` +
      `Address:\n234 Luxury Drive\nIndia, DL 94107\n\n` +
      `📞 Phone: +1 234 567890\n\n` +
      `📧 Email: info@example.com\n\n` +
      `We're here to help! Feel free to reach out anytime.`
  }

  // Function to send message to Groq chatbot
  const sendMessageToChatbot = async (userMessage) => {
    try {
      // Prepare conversation history (last 10 messages)
      const history = messages
        .slice(-10)
        .filter(msg => msg.sender === 'user' || msg.sender === 'bot')
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }));

      // Call your backend API
      const { data } = await axios.post('/api/chatbot/message', {
        message: userMessage,
        conversationHistory: history
      });

      if (data.success) {
        return data.response;
      } else {
        // Return fallback message if API fails
        return data.message + '\n\n' + (data.fallback || '');
      }
    } catch (error) {
      console.error('Chatbot API Error:', error);

      // Fallback messages for different scenarios
      if (error.response?.status === 429) {
        return '⚠️ Too many requests. Please wait a moment and try again.\n\nYou can use the quick action buttons below for instant answers!';
      } else if (error.response?.status === 503) {
        return '🔌 Connection issue. Please check your internet and try again.\n\nYou can still use the quick action buttons!';
      } else {
        return '⚠️ I\'m having trouble connecting right now.\n\nPlease use the quick action buttons below:\n• Browse Cars\n• Check Availability\n• My Bookings\n• Help & Support';
      }
    }
  };

  const handleOptionClick = async (option) => {
    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now(),
      text: option.label,
      sender: 'user'
    }])

    // Handle different actions
    if (option.action === 'browse_cars') {
      // Show loading message
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "Let me fetch all available cars for you...",
        sender: 'bot',
        showOptions: false
      }])

      // Fetch cars from API
      const carsResponse = await fetchCarsForChat()

      // Update last message with actual data and show options again
      setMessages(prev => {
        const newMessages = [...prev]
        newMessages[newMessages.length - 1] = {
          id: Date.now() + 2,
          text: carsResponse,
          sender: 'bot',
          showOptions: true
        }
        return newMessages
      })
    } else if (option.action === 'check_availability') {
      // Show loading message
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "Checking available cars for you...",
        sender: 'bot',
        showOptions: false
      }])

      // Fetch available cars from API
      const availableCarsResponse = await fetchAvailableCars()

      // Update last message with actual data and show options again
      setMessages(prev => {
        const newMessages = [...prev]
        newMessages[newMessages.length - 1] = {
          id: Date.now() + 2,
          text: availableCarsResponse,
          sender: 'bot',
          showOptions: true
        }
        return newMessages
      })
    } else if (option.action === 'my_bookings') {
      // Show loading message
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "Fetching your bookings...",
        sender: 'bot',
        showOptions: false
      }])

      // Fetch user bookings from API
      const bookingsResponse = await fetchUserBookings()

      // Update last message with actual data and show options again
      setMessages(prev => {
        const newMessages = [...prev]
        newMessages[newMessages.length - 1] = {
          id: Date.now() + 2,
          text: bookingsResponse,
          sender: 'bot',
          showOptions: true
        }
        return newMessages
      })
    } else if (option.action === 'pricing') {
      // Show loading message
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "Fetching rental pricing...",
        sender: 'bot',
        showOptions: false
      }])

      // Fetch rental pricing from API
      const pricingResponse = await fetchRentalPricing()

      // Update last message with actual data and show options again
      setMessages(prev => {
        const newMessages = [...prev]
        newMessages[newMessages.length - 1] = {
          id: Date.now() + 2,
          text: pricingResponse,
          sender: 'bot',
          showOptions: true
        }
        return newMessages
      })
    } else if (option.action === 'help') {
      // Show help and support information immediately (no API call needed)
      const helpResponse = getHelpAndSupport()

      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: helpResponse,
          sender: 'bot',
          showOptions: true
        }])
      }, 500)
    } else {
      // For any other options, show default response
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: `Great! Let me help you with ${option.label.toLowerCase()}...`,
          sender: 'bot',
          showOptions: true
        }])
      }, 800)
    }
  }

  const handleSend = async () => {
    if (inputText.trim()) {
      // Add user message
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: inputText,
        sender: 'user'
      }]);

      const userInput = inputText;
      setInputText(''); // Clear input immediately
      setLoading(true);

      // Get response from chatbot
      const botResponse = await sendMessageToChatbot(userInput);

      // Add bot response
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: botResponse,
        sender: 'bot',
        showOptions: true // Show quick actions after response
      }]);

      setLoading(false);
    }
  };





  return (
    <div className="fixed bottom-6 right-6 z-50 ">

      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-indigo-100 animate-in slide-in-from-bottom-5 duration-300">

          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <Bot className="text-indigo-600" size={24} />
              </div>
              <div>
                <h3 className="text-white font-semibold">Car Rental Assistant</h3>
                <p className="text-indigo-200 text-xs">Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-indigo-500 p-2 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div key={msg.id}>
                <div
                  className={`flex gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'bot' ? 'bg-indigo-100' : 'bg-gray-200'
                    }`}>
                    {msg.sender === 'bot' ? (
                      <Bot className="text-indigo-600" size={18} />
                    ) : (
                      <User className="text-gray-600" size={18} />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className={`max-w-[75%] px-4 py-2 rounded-2xl ${msg.sender === 'bot'
                    ? 'bg-white text-gray-800 rounded-tl-none shadow-sm'
                    : 'bg-indigo-600 text-white rounded-tr-none'
                    }`}>
                    <p className="text-sm whitespace-pre-line">{msg.text}</p>
                  </div>
                </div>

                {/* Quick Reply Options - Only show for bot messages with showOptions */}
                {msg.sender === 'bot' && msg.showOptions && (
                  <div className="mt-3 ml-10 flex flex-wrap gap-2">
                    {quickOptions.map((option, index) => {
                      const IconComponent = option.icon
                      return (
                        <button
                          key={index}
                          onClick={() => handleOptionClick(option)}
                          disabled={loading}
                          className="flex items-center gap-2 px-3 py-2 border border-indigo-300 text-indigo-700 rounded-full text-xs hover:bg-indigo-50 hover:border-indigo-400 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <IconComponent size={14} />
                          {option.label}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-indigo-100">
                  <Bot className="text-indigo-600 animate-pulse" size={18} />
                </div>
                <div className="bg-white px-4 py-2 rounded-2xl rounded-tl-none shadow-sm">
                  <p className="text-sm text-gray-500">Typing...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Add this div at the very end - invisible scroll target */}

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={loading}
                className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-colors flex items-center justify-center w-10 h-10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
            </div>
          </div>

          {/* Powered By Watermark */}
          <div className="px-4 pb-2">
            <p className="text-center text-[10px] text-gray-400">
              Powered by <span className="font-medium text-indigo-600">ChatNinjaz</span>
            </p>
          </div>

        </div>
      )
      }

      {/* Floating Button */}
      {
        !isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="bg-indigo-600 text-white p-4 rounded-full shadow-2xl hover:bg-indigo-700 transition-all hover:scale-110 active:scale-95 group"
          >
            <MessageCircle size={28} className="group-hover:animate-bounce" />
          </button>
        )
      }
    </div >
  )
}

export default FloatingChatBot

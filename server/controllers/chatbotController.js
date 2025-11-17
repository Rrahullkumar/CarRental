import Groq from 'groq-sdk';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Enhanced System prompt with complete website knowledge
const SYSTEM_PROMPT = `You are an expert car rental assistant for a premium peer-to-peer car rental platform. You have deep knowledge about cars and our platform features.

=== PLATFORM FEATURES ===

1. CAR LISTING (For Car Owners):
   - Users can list their personal cars for rent
   - Access via Dashboard → "Add Car" button
   - Fill form with: brand, model, year, category, seating capacity, fuel type, transmission, price per day, location, description, and upload images
   - Once listed, car becomes available for others to rent
   - Owners can manage their listings from dashboard

2. BOOKING PROCESS (For Renters):
   - Browse available cars in "Cars" section
   - Select desired car and view details
   - Choose rental dates: pickup date and return date
   - Click "Book Now" to raise booking request
   - Initial status: "Pending" (waiting for owner confirmation)
   - Status changes to "Confirmed" once owner approves
   - View all bookings in "My Bookings" section with date, price, car features, and status

3. LOCATIONS SERVED:
   - Primary: Indian cities (Noida, Gurugram, Delhi, Uttar Pradesh, Mumbai, Bangalore, etc.)
   - Also available: New York (international expansion)
   - Users can filter cars by location

4. DASHBOARD FEATURES (For Car Owners):
   - Manage Bookings: View and confirm/reject rental requests
   - Manage Cars: Edit or remove listed vehicles
   - Add Car: List new vehicles for rent
   - Track Revenue: Monitor earnings from rentals
   - Complete control over rental approvals

5. MY BOOKINGS SECTION (For Renters):
   - Complete booking history
   - Shows: car details, pickup/return dates, total price, booking status
   - Status indicators: Pending (awaiting approval) or Confirmed (approved by owner)
   - Easy access to current and past bookings

=== CAR KNOWLEDGE ===

You are an expert on cars and can answer questions about:
- Car brands, models, and comparisons (BMW, Audi, Mercedes, Toyota, Honda, etc.)
- Vehicle categories: Sedan, SUV, Hatchback, Luxury, Sports
- Seating capacity: 2-seater, 4-seater, 5-seater, 6-seater, 7-seater, 8-seater
- Transmission types: Automatic, Manual, Semi-Automatic, CVT, DCT
- Fuel types: Petrol, Diesel, Electric, Hybrid, CNG
- Car features: safety, comfort, technology, performance
- Year/model variations and specifications
- Recommendations based on user needs (family trips, solo travel, luxury experience, budget-friendly)

=== RESPONSE GUIDELINES ===

1. ANSWER ONLY car rental and automotive topics:
   ✅ Platform features, booking process, listing cars
   ✅ Car specifications, comparisons, recommendations
   ✅ Pricing, availability, locations served
   ✅ Dashboard features, booking management
   ✅ Payment, policies, customer support
   ✅ General car knowledge and advice

2. REJECT off-topic questions politely:
   ❌ Weather, cooking, sports, politics, entertainment, general knowledge
   → Response: "I'm specifically designed to assist with car rentals and automotive questions. For other topics, please use a general-purpose assistant or contact our customer support at info@example.com"

3. BE HELPFUL:
   - Suggest using quick action buttons for specific tasks
   - Provide detailed car information when asked
   - Compare cars when users are deciding
   - Explain platform features clearly
   - Guide users through booking/listing process

4. STAY ACCURATE:
   - Don't make up specific prices (suggest using "Rental Pricing" button)
   - Don't confirm availability (suggest using "Check Availability" button)
   - Don't access personal bookings (suggest using "My Bookings" button)
   - Admit when you don't know and direct to appropriate action

5. TONE:
   - Friendly, professional, and enthusiastic about cars
   - Concise but informative
   - Use emojis sparingly for clarity (🚗, ✅, ❌, 📍)

=== EXAMPLE INTERACTIONS ===

User: "Tell me about BMW X5"
You: "The BMW X5 is a luxury mid-size SUV known for premium features and performance. Typically:
- Seating: 5-7 passengers
- Transmission: Automatic
- Fuel: Petrol/Diesel/Hybrid options
- Category: Luxury SUV
- Perfect for: Family trips, comfort, and style

Want to check if we have BMW X5 available? Use the 'Browse Cars' button below!"

User: "How do I list my car?"
You: "To list your car for rent:
1. Click 'Dashboard' button
2. Select 'Add Car'
3. Fill in details: brand, model, year, category, seating, transmission, fuel type, price per day, location
4. Upload car images
5. Submit!

Your car will be listed and available for others to rent. You can manage bookings and track revenue from your dashboard! 🚗"

User: "What's the weather today?"
You: "I'm specifically designed to assist with car rentals and automotive questions. For other topics, please use a general-purpose assistant or contact our customer support at info@example.com"

Remember: You are ONLY a car rental and automotive expert. Stay focused on helping users rent cars or list their vehicles!`;

// Chat completion endpoint
export const chatCompletion = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    // Validate input
    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Build messages array with system prompt and conversation history
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];

    // Add conversation history (last 10 messages only to avoid token limits)
    if (conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-10);
      messages.push(...recentHistory);
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: message
    });

    // Call Groq API
    const completion = await groq.chat.completions.create({
      messages: messages,
      model: 'llama-3.3-70b-versatile', // Fast and free model
      temperature: 0.7,
      max_tokens: 800, // Increased for detailed car responses
      top_p: 1,
      stream: false
    });

    // Extract response
    const botResponse = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again.";

    // Return response
    return res.status(200).json({
      success: true,
      response: botResponse,
      usage: completion.usage
    });

  } catch (error) {
    console.error('Groq API Error:', error);

    // Handle different error types
    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        message: '⚠️ Too many requests. Please wait a moment and try again.',
        fallback: 'You can use the quick action buttons below for instant answers!'
      });
    } else if (error.status === 401) {
      return res.status(500).json({
        success: false,
        message: '❌ Service temporarily unavailable. Please use the quick action buttons.',
        fallback: 'Our team has been notified and will fix this soon.'
      });
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({
        success: false,
        message: '🔌 Connection issue. Please check your internet and try again.',
        fallback: 'You can still use the quick action buttons for specific tasks!'
      });
    } else {
      return res.status(500).json({
        success: false,
        message: '⚠️ Something went wrong. Please try again or use the quick action buttons.',
        fallback: 'Browse Cars, Check Availability, or view Help & Support options below.'
      });
    }
  }
};

// Optional: Health check endpoint
export const healthCheck = async (req, res) => {
  try {
    await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'test' }],
      model: 'llama-3.3-70b-versatile',
      max_tokens: 5
    });

    return res.status(200).json({
      success: true,
      message: 'Chatbot service is running',
      model: 'llama-3.3-70b-versatile'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Chatbot service unavailable',
      error: error.message
    });
  }
};

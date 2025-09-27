import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MessageCircle, 
  Send, 
  Mic, 
  MicOff, 
  Volume2,
  VolumeX,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Leaf,
  Bot,
  User
} from 'lucide-react';

interface AIResponse {
  advice_hindi: string;
  advice_english_summary: string;
  confidence_percent: string;
}

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  aiResponse?: AIResponse;
  isVoice?: boolean;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface CustomSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    webkitSpeechRecognition: new () => CustomSpeechRecognition;
    SpeechRecognition: new () => CustomSpeechRecognition;
  }
}

export default function VoiceAIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'नमस्ते! मैं आपका KrishiAI Voice Assistant हूं। आप मुझसे खेती के बारे में हिंदी या अंग्रेजी में बात कर सकते हैं। माइक बटन दबाकर बोलें या टाइप करें।',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi'>('hi');
  const [error, setError] = useState<string | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognition = useRef<CustomSpeechRecognition | null>(null);
  const synthesis = useRef<SpeechSynthesis | null>(null);

  // API Configuration - Updated with new key
  const API_KEY = '3f789e207e6349eaa9a406a020c94b85';
  const BASE_URL = 'https://api.aimlapi.com/v1';
  const MODEL = 'deepseek/deepseek-prover-v2';

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      
      recognition.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
        handleSendMessage(transcript, true);
      };
      
      recognition.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        setIsListening(false);
        setError(`Voice recognition error: ${event.error}`);
      };

      recognition.current.onend = () => {
        setIsListening(false);
      };
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthesis.current = window.speechSynthesis;
    }
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Test minimal API connection first
  const testMinimalAPI = async (): Promise<boolean> => {
    try {
      console.log('🔍 Testing minimal API connection...');
      setDebugInfo('🔍 Testing minimal API connection...');
      
      const testPayload = {
        model: MODEL,
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 50
      };

      console.log('📤 Minimal Test Request:', {
        url: `${BASE_URL}/chat/completions`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: testPayload
      });

      const response = await fetch(`${BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify(testPayload)
      });

      console.log('📥 Minimal Test Response Status:', response.status);
      console.log('📥 Minimal Test Response Headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Minimal Test Success:', data);
        setDebugInfo('✅ Minimal API test successful!');
        return true;
      } else {
        const errorText = await response.text();
        console.error('❌ Minimal Test Failed:', response.status, errorText);
        setDebugInfo(`❌ Minimal test failed: ${response.status} - ${errorText}`);
        return false;
      }
    } catch (error) {
      console.error('💥 Minimal Test Error:', error);
      setDebugInfo(`💥 Minimal test error: ${error}`);
      return false;
    }
  };

  // Enhanced API call with multiple authentication attempts
  const callOpenAI = async (userInput: string): Promise<AIResponse> => {
    const farmingPrompt = `You are an AI Farming Assistant. Only answer agriculture/farming related queries. 
Automatically detect the user's language and provide a detailed answer in Hindi with a short English summary.
Output must be in JSON format:
{
  "advice_hindi": "<Detailed answer in Hindi>",
  "advice_english_summary": "<Short English summary>",
  "confidence_percent": "<AI confidence level as number>"
}
User Input: ${userInput}`;

    // First test minimal connection
    const minimalTest = await testMinimalAPI();
    if (!minimalTest) {
      throw new Error('Minimal API test failed - authentication issue');
    }

    try {
      setDebugInfo('🚀 Making full API request...');
      console.log('🚀 Full API Request Starting...');
      console.log('🔑 API Key (first 8 chars):', API_KEY.substring(0, 8));
      console.log('🌐 Base URL:', BASE_URL);
      console.log('🤖 Model:', MODEL);

      // Exact payload matching Python implementation
      const requestPayload = {
        model: MODEL,
        messages: [
          {
            role: 'user',
            content: farmingPrompt
          }
        ],
        temperature: 0.7,
        top_p: 0.7,
        frequency_penalty: 1,
        max_tokens: 1536,
        top_k: 50
      };

      console.log('📤 Full Request Payload:', JSON.stringify(requestPayload, null, 2));

      // Try different header configurations
      const headerConfigs = [
        // Config 1: Standard Bearer token
        {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        // Config 2: With User-Agent
        {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
          'User-Agent': 'KrishiAI-Voice-Assistant/1.0'
        },
        // Config 3: With additional headers
        {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      ];

      let lastError: Error | null = null;

      for (let i = 0; i < headerConfigs.length; i++) {
        try {
          console.log(`🔄 Trying header config ${i + 1}:`, headerConfigs[i]);
          setDebugInfo(`🔄 Trying authentication method ${i + 1}...`);

          const response = await fetch(`${BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: headerConfigs[i],
            body: JSON.stringify(requestPayload)
          });

          console.log(`📥 Config ${i + 1} Response Status:`, response.status);
          console.log(`📥 Config ${i + 1} Response Headers:`, Object.fromEntries(response.headers.entries()));

          if (response.ok) {
            const data = await response.json();
            console.log('✅ API Success with config', i + 1, ':', data);
            setDebugInfo(`✅ Success with authentication method ${i + 1}!`);

            if (data.choices && data.choices[0] && data.choices[0].message) {
              const aiText = data.choices[0].message.content;
              console.log('🤖 AI Response Text:', aiText);
              
              try {
                const parsedResponse = JSON.parse(aiText);
                return {
                  advice_hindi: parsedResponse.advice_hindi || aiText,
                  advice_english_summary: parsedResponse.advice_english_summary || 'Response received',
                  confidence_percent: parsedResponse.confidence_percent || "85"
                };
              } catch (parseError) {
                console.warn('⚠️ JSON parsing failed, using fallback');
                return {
                  advice_hindi: aiText,
                  advice_english_summary: 'AI response received in text format',
                  confidence_percent: "75"
                };
              }
            } else {
              throw new Error('Invalid response structure');
            }
          } else {
            const errorText = await response.text();
            console.error(`❌ Config ${i + 1} Failed:`, response.status, errorText);
            
            // Parse error details
            let errorDetails = errorText;
            try {
              const errorJson = JSON.parse(errorText);
              errorDetails = errorJson.error?.message || errorJson.message || errorText;
            } catch (e) {
              // Keep original error text
            }

            lastError = new Error(`HTTP ${response.status}: ${errorDetails}`);
            
            // If it's not an auth error, break early
            if (response.status !== 401 && response.status !== 403) {
              break;
            }
          }
        } catch (fetchError) {
          console.error(`💥 Config ${i + 1} Fetch Error:`, fetchError);
          lastError = fetchError instanceof Error ? fetchError : new Error('Unknown fetch error');
        }
      }

      // If all configs failed, throw the last error
      throw lastError || new Error('All authentication methods failed');

    } catch (error) {
      console.error('💥 Complete API Failure:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setDebugInfo(`💥 API Error: ${errorMessage}`);
      
      // Enhanced error categorization
      if (errorMessage.includes('401') || errorMessage.includes('403') || errorMessage.includes('authentication')) {
        return {
          advice_hindi: `API की पहुंच में समस्या है। Error: ${errorMessage}`,
          advice_english_summary: `API authentication failed: ${errorMessage}`,
          confidence_percent: "0"
        };
      }
      
      if (errorMessage.includes('429')) {
        return {
          advice_hindi: "API की दर सीमा पार हो गई है। कृपया कुछ देर बाद कोशिश करें।",
          advice_english_summary: "API rate limit exceeded. Please try again later.",
          confidence_percent: "0"
        };
      }

      if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
        return {
          advice_hindi: "नेटवर्क कनेक्शन की समस्या है। कृपया अपना इंटरनेट कनेक्शन जांचें।",
          advice_english_summary: "Network connection issue. Please check your internet connection.",
          confidence_percent: "0"
        };
      }

      // Generic fallback
      return {
        advice_hindi: `AI सेवा में समस्या: ${errorMessage}`,
        advice_english_summary: `AI service error: ${errorMessage}`,
        confidence_percent: "0"
      };
    }
  };

  const speakText = (text: string, lang: 'hi' | 'en' = 'hi') => {
    if (!synthesis.current || !voiceEnabled) return;

    synthesis.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthesis.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthesis.current) {
      synthesis.current.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSendMessage = async (messageText?: string, isVoiceInput: boolean = false) => {
    const textToSend = messageText || inputMessage;
    if (!textToSend.trim()) return;

    setError(null);
    setDebugInfo('');
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: textToSend,
      timestamp: new Date(),
      isVoice: isVoiceInput
    };

    setMessages(prev => [...prev, userMessage]);
    if (!messageText) setInputMessage('');
    setIsProcessing(true);

    try {
      const aiResponse = await callOpenAI(textToSend);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: aiResponse.advice_hindi,
        timestamp: new Date(),
        aiResponse
      };

      setMessages(prev => [...prev, botMessage]);

      // Auto-play voice response if voice was used for input and confidence > 0
      if (isVoiceInput && voiceEnabled && aiResponse.confidence_percent !== "0") {
        setTimeout(() => {
          speakText(aiResponse.advice_hindi, 'hi');
        }, 500);
      }
    } catch (error) {
      setError(`Failed to get AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Message Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceInput = () => {
    if (!recognition.current) {
      setError('Voice recognition not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      recognition.current.stop();
      setIsListening(false);
    } else {
      setError(null);
      recognition.current.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      recognition.current.start();
      setIsListening(true);
    }
  };

  const formatConfidence = (confidence: string): number => {
    const num = parseInt(confidence.replace('%', ''));
    return isNaN(num) ? 0 : num;
  };

  const runDiagnostics = async () => {
    setIsProcessing(true);
    setError(null);
    setDebugInfo('🔍 Running comprehensive diagnostics...');
    
    try {
      console.log('🔍 === STARTING DIAGNOSTICS ===');
      
      // Test 1: Basic connectivity
      setDebugInfo('🔍 Step 1: Testing basic connectivity...');
      const basicTest = await testMinimalAPI();
      
      if (basicTest) {
        // Test 2: Full API call
        setDebugInfo('🔍 Step 2: Testing full API call...');
        const testResponse = await callOpenAI('Test: What is wheat farming?');
        
        if (testResponse.confidence_percent !== "0") {
          setDebugInfo('✅ All diagnostics passed! API is working.');
          
          const diagnosticMessage: Message = {
            id: Date.now().toString(),
            type: 'bot',
            content: `✅ Diagnostics Successful!\n\n${testResponse.advice_hindi}`,
            timestamp: new Date(),
            aiResponse: testResponse
          };
          
          setMessages(prev => [...prev, diagnosticMessage]);
        } else {
          setError('Diagnostics completed but API returned error response.');
        }
      } else {
        setError('Basic connectivity test failed. Check API key and network.');
      }
    } catch (error) {
      setError(`Diagnostics failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Diagnostics Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            Voice AI Assistant - कृषि सहायक (Debug Mode)
            <Badge variant="secondary" className="ml-auto">
              {language === 'hi' ? 'हिंदी' : 'English'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4" variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {debugInfo && (
            <Alert className="mb-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{debugInfo}</AlertDescription>
            </Alert>
          )}

          <ScrollArea className="h-96 w-full border rounded-lg p-4 mb-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {message.type === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                      <span className="text-xs font-medium">
                        {message.type === 'user' ? 'You' : 'KrishiAI'}
                      </span>
                      {message.isVoice && (
                        <Mic className="h-3 w-3 opacity-70" />
                      )}
                    </div>
                    
                    <p className="text-sm whitespace-pre-line mb-2">{message.content}</p>
                    
                    {message.aiResponse && (
                      <div className="mt-3 space-y-2 border-t border-gray-200 pt-2">
                        <div className="text-xs text-gray-600">
                          <strong>English Summary:</strong>
                          <p className="mt-1">{message.aiResponse.advice_english_summary}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${
                              formatConfidence(message.aiResponse.confidence_percent) > 70 
                                ? 'bg-green-100 text-green-800' 
                                : formatConfidence(message.aiResponse.confidence_percent) > 0
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            Confidence: {message.aiResponse.confidence_percent}%
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => speakText(message.content, 'hi')}
                            disabled={isSpeaking}
                            className="h-6 w-6 p-0"
                          >
                            <Volume2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <p className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">AI सोच रहा है...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>

          <div className="flex gap-2 mb-4">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={language === 'hi' ? 'खेती के बारे में पूछें...' : 'Ask about farming...'}
              onKeyPress={(e) => e.key === 'Enter' && !isProcessing && handleSendMessage()}
              className="flex-1"
              disabled={isProcessing}
            />
            
            <Button
              variant="outline"
              size="icon"
              onClick={handleVoiceInput}
              disabled={!recognition.current || isProcessing}
              className={isListening ? 'bg-red-100 text-red-600 animate-pulse' : ''}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={isSpeaking ? stopSpeaking : () => {}}
              disabled={!synthesis.current}
              className={isSpeaking ? 'bg-blue-100 text-blue-600' : ''}
            >
              {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            
            <Button 
              onClick={() => handleSendMessage()} 
              disabled={isProcessing || !inputMessage.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <Button
                variant={language === 'en' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLanguage('en')}
              >
                English
              </Button>
              <Button
                variant={language === 'hi' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLanguage('hi')}
              >
                हिंदी
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={voiceEnabled ? 'text-green-600' : 'text-gray-400'}
              >
                {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                <span className="ml-2 text-xs">
                  Voice {voiceEnabled ? 'On' : 'Off'}
                </span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={runDiagnostics}
                disabled={isProcessing}
                className="text-blue-600"
              >
                🔍 Run Diagnostics
              </Button>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200">
            <h4 className="font-medium text-red-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Debug Mode - Authentication Troubleshooting:
            </h4>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• 🔑 API Key: {API_KEY.substring(0, 8)}... (length: {API_KEY.length})</li>
              <li>• 🌐 Endpoint: {BASE_URL}/chat/completions</li>
              <li>• 🤖 Model: {MODEL}</li>
              <li>• 🔍 Multiple auth methods tested automatically</li>
              <li>• 📊 Comprehensive error logging enabled</li>
              <li>• 🧪 Run diagnostics to test authentication</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
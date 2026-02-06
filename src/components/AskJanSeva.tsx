import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Volume2, Loader2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { schemes } from '@/data/schemes';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export const AskJanSeva: React.FC = () => {
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const translations = {
    title: { en: 'Ask JanSeva', hi: 'जनसेवा से पूछें', mr: 'जनसेवाला विचारा' },
    subtitle: { 
      en: 'Get answers about government schemes', 
      hi: 'सरकारी योजनाओं के बारे में जवाब पाएं', 
      mr: 'सरकारी योजनांबद्दल उत्तरे मिळवा' 
    },
    placeholder: { 
      en: 'Ask about any scheme...', 
      hi: 'किसी भी योजना के बारे में पूछें...', 
      mr: 'कोणत्याही योजनेबद्दल विचारा...' 
    },
    welcomeMessage: {
      en: 'Hello! I am JanSeva, your assistant for Maharashtra government schemes. Ask me about eligibility, documents, or how to apply for any scheme.',
      hi: 'नमस्ते! मैं जनसेवा हूं, महाराष्ट्र सरकार की योजनाओं के लिए आपका सहायक। मुझसे पात्रता, दस्तावेज, या किसी भी योजना के लिए आवेदन कैसे करें पूछें।',
      mr: 'नमस्कार! मी जनसेवा आहे, महाराष्ट्र सरकारच्या योजनांसाठी तुमचा सहाय्यक. मला पात्रता, कागदपत्रे किंवा कोणत्याही योजनेसाठी अर्ज कसा करायचा याबद्दल विचारा.'
    },
    outOfScope: {
      en: 'I apologize, but I can only answer questions about Maharashtra government schemes. Please ask about eligibility, documents, benefits, or how to apply for specific schemes.',
      hi: 'क्षमा करें, मैं केवल महाराष्ट्र सरकार की योजनाओं के बारे में प्रश्नों का उत्तर दे सकता हूं। कृपया पात्रता, दस्तावेज, लाभ, या विशिष्ट योजनाओं के लिए आवेदन कैसे करें पूछें।',
      mr: 'माफ करा, मी फक्त महाराष्ट्र सरकारच्या योजनांबद्दल प्रश्नांची उत्तरे देऊ शकतो. कृपया पात्रता, कागदपत्रे, फायदे किंवा विशिष्ट योजनांसाठी अर्ज कसा करायचा याबद्दल विचारा.'
    },
    suggestedQuestions: { en: 'Suggested Questions', hi: 'सुझाए गए प्रश्न', mr: 'सुचवलेले प्रश्न' },
    voiceInput: { en: 'Voice Input', hi: 'आवाज इनपुट', mr: 'आवाज इनपुट' },
    send: { en: 'Send', hi: 'भेजें', mr: 'पाठवा' },
  };

  const suggestedQuestions = [
    { en: 'Who can apply for Majhi Kanya Bhagyashree?', hi: 'माझी कन्या भाग्यश्री के लिए कौन आवेदन कर सकता है?', mr: 'माझी कन्या भाग्यश्रीसाठी कोण अर्ज करू शकते?' },
    { en: 'What documents are needed for health scheme?', hi: 'स्वास्थ्य योजना के लिए कौन से दस्तावेज चाहिए?', mr: 'आरोग्य योजनेसाठी कोणती कागदपत्रे लागतात?' },
    { en: 'How to get pension for senior citizens?', hi: 'वरिष्ठ नागरिकों के लिए पेंशन कैसे प्राप्त करें?', mr: 'ज्येष्ठ नागरिकांसाठी पेन्शन कसे मिळवायचे?' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: '0',
        text: t(translations.welcomeMessage),
        isUser: false,
        timestamp: new Date(),
      }]);
    }
  }, [language]);

  const findAnswer = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    // Check each scheme's FAQs
    for (const scheme of schemes) {
      for (const faq of scheme.faqs) {
        const faqQuestion = faq.question[language].toLowerCase();
        const keywords = faqQuestion.split(' ').filter(w => w.length > 3);
        
        const matchScore = keywords.filter(keyword => 
          lowerQuestion.includes(keyword.toLowerCase())
        ).length;
        
        if (matchScore >= 2 || lowerQuestion.includes(scheme.translations[language].name.toLowerCase())) {
          return faq.answer[language];
        }
      }
      
      // Check if asking about this scheme's details
      if (lowerQuestion.includes(scheme.translations[language].name.toLowerCase())) {
        const schemeInfo = scheme.translations[language];
        return `${schemeInfo.name}: ${schemeInfo.description}\n\n${t({ en: 'Eligibility', hi: 'पात्रता', mr: 'पात्रता' })}: ${schemeInfo.eligibility.join(', ')}`;
      }
    }
    
    // Check for general keywords
    const keywordResponses: Record<string, { en: string; hi: string; mr: string }> = {
      'apply': { 
        en: 'To apply for government schemes, visit the respective department website or your nearest Gram Panchayat/Tehsildar office with required documents.', 
        hi: 'सरकारी योजनाओं के लिए आवेदन करने के लिए, संबंधित विभाग की वेबसाइट या अपने निकटतम ग्राम पंचायत/तहसीलदार कार्यालय में आवश्यक दस्तावेजों के साथ जाएं।',
        mr: 'सरकारी योजनांसाठी अर्ज करण्यासाठी, संबंधित विभागाच्या वेबसाइटला भेट द्या किंवा आवश्यक कागदपत्रांसह जवळच्या ग्रामपंचायत/तहसीलदार कार्यालयात जा.'
      },
      'document': { 
        en: 'Common documents required: Aadhaar Card, Income Certificate, Domicile Certificate, Bank Account Details, and category-specific documents like Caste Certificate or Land Records.', 
        hi: 'आवश्यक सामान्य दस्तावेज: आधार कार्ड, आय प्रमाण पत्र, अधिवास प्रमाण पत्र, बैंक खाता विवरण, और श्रेणी-विशिष्ट दस्तावेज जैसे जाति प्रमाण पत्र या भूमि रिकॉर्ड।',
        mr: 'आवश्यक सामान्य कागदपत्रे: आधार कार्ड, उत्पन्न प्रमाणपत्र, अधिवास प्रमाणपत्र, बँक खाते तपशील, आणि जात प्रमाणपत्र किंवा जमीन नोंदी सारखी विशिष्ट कागदपत्रे.'
      },
    };
    
    for (const [keyword, response] of Object.entries(keywordResponses)) {
      if (lowerQuestion.includes(keyword)) {
        return response[language];
      }
    }
    
    return t(translations.outOfScope);
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const answer = findAnswer(inputText);
    
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: answer,
      isUser: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, botMessage]);
    setIsTyping(false);
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input not supported in this browser');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    const langCodes = { en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN' };
    recognition.lang = langCodes[language];
    recognition.continuous = false;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
    };
    
    recognition.start();
  };

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      const langCodes = { en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN' };
      utterance.lang = langCodes[language];
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <Card className="mx-auto max-w-2xl shadow-elevated">
      <CardHeader className="hero-gradient text-primary-foreground rounded-t-lg">
        <CardTitle className="flex items-center gap-3 text-xl">
          <MessageCircle className="h-6 w-6" />
          <div>
            <span className="font-marathi">{t(translations.title)}</span>
            <p className="text-sm font-normal opacity-90 mt-1">{t(translations.subtitle)}</p>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Messages area */}
        <div className="h-80 overflow-y-auto p-4 space-y-4 bg-muted/30">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.isUser
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-card shadow-soft rounded-bl-sm'
                }`}
              >
                <p className="text-sm whitespace-pre-line">{message.text}</p>
                {!message.isUser && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-7 px-2 text-xs"
                    onClick={() => speakMessage(message.text)}
                  >
                    <Volume2 className="h-3 w-3 mr-1" />
                    {t({ en: 'Listen', hi: 'सुनें', mr: 'ऐका' })}
                  </Button>
                )}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-card shadow-soft rounded-2xl rounded-bl-sm px-4 py-3">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested questions */}
        {messages.length <= 1 && (
          <div className="border-t border-border p-4 bg-muted/20">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              {t(translations.suggestedQuestions)}
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  className="text-xs h-auto py-2 px-3 whitespace-normal text-left"
                  onClick={() => setInputText(q[language])}
                >
                  {q[language]}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="border-t border-border p-4 flex gap-2">
          <Button
            variant={isListening ? 'destructive' : 'outline'}
            size="icon"
            onClick={handleVoiceInput}
            title={t(translations.voiceInput)}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t(translations.placeholder)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1"
          />
          
          <Button onClick={handleSend} disabled={!inputText.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

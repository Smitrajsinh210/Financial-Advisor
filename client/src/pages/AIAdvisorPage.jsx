import { Mic, SendHorizonal } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import useAsync from "../hooks/useAsync";
import api from "../utils/api";
import Loader from "../components/ui/Loader";

const starterPrompts = [
  "How can I save ₹10,000 in 3 months?",
  "Best budget for ₹25,000 salary?",
  "Reduce food expenses tips?"
];

const AIAdvisorPage = () => {
  const { data, loading, setData } = useAsync(async () => {
    const response = await api.get("/ai/history");
    return response.data.data;
  }, []);
  const [prompt, setPrompt] = useState(starterPrompts[0]);
  const [asking, setAsking] = useState(false);
  const [listening, setListening] = useState(false);

  const askAdvisor = async () => {
    if (!prompt.trim()) return;
    setAsking(true);
    try {
      const response = await api.post("/ai/advisor", { prompt });
      setData((prev) => [response.data.data.chat, ...(prev || [])]);
      setPrompt("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not reach advisor");
    } finally {
      setAsking(false);
    }
  };

  const useVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Voice recognition is not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setPrompt(transcript);
      setListening(false);
      toast.success("Voice note captured");
    };

    recognition.onerror = () => {
      setListening(false);
      toast.error("Voice capture failed");
    };

    recognition.onend = () => setListening(false);
    recognition.start();
  };

  if (loading) return <Loader label="Loading advisor..." />;

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="card">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">AI Chat Advisor</h2>
            <p className="mt-2 text-slate-400">Budget suggestions, savings plans, debt strategy, and emergency fund guidance.</p>
          </div>
          <button className="btn-secondary" type="button" onClick={useVoiceInput}>
            <Mic size={18} />
            {listening ? "Listening..." : "Voice"}
          </button>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {starterPrompts.map((item) => (
            <button key={item} type="button" className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300" onClick={() => setPrompt(item)}>
              {item}
            </button>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <textarea
            className="input min-h-[160px]"
            placeholder="Ask anything about budgeting, debt, saving, investing basics, salary planning, retirement, insurance, taxes, or financial habits..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>
        <button className="btn-primary mt-4" type="button" onClick={askAdvisor} disabled={asking}>
          <SendHorizonal className="mr-2" size={18} />
          {asking ? "Thinking..." : "Ask advisor"}
        </button>

        <div className="mt-6 rounded-3xl bg-slate-900/70 p-5">
          <h3 className="font-semibold">What this advisor can help with</h3>
          <p className="mt-4 text-sm text-slate-300">
            Budgeting, expense cuts, savings plans, debt payoff order, emergency funds, insurance basics, retirement planning, beginner investing, cash-flow decisions, and personal finance tradeoffs.
          </p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-2xl font-bold">Conversation</h2>
        <div className="mt-6 space-y-4">
          {!data.length ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
              Start the conversation with any finance question and the advisor will keep the recent context in mind.
            </div>
          ) : null}
          {[...(data || [])].slice().reverse().map((item) => (
            <div key={item._id} className="space-y-3">
              <div className="ml-auto max-w-[85%] rounded-3xl rounded-br-md bg-brand-500 px-5 py-4 text-slate-950">
                <p className="text-sm font-semibold">You</p>
                <p className="mt-2 text-sm">{item.question}</p>
              </div>
              <div className="max-w-[90%] rounded-3xl rounded-bl-md border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-semibold text-white">AI Advisor</p>
                <pre className="mt-3 whitespace-pre-wrap text-sm text-slate-300">{item.response}</pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIAdvisorPage;

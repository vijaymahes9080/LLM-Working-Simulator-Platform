import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL, WS_BASE_URL } from '@/config';

export interface TokenInfo {
  text: string;
  id: number;
  start: number;
  end: number;
}

export interface SimulationResult {
  text: string;
  char_count: number;
  word_count: number;
  tokens: TokenInfo[];
  token_ids: number[];
  embeddings: number[][];
  pca_coords: number[][];
  positional_encoding: number[][];
  num_layers: number;
  attention_heads: number[][][]; // [heads, seq, seq]
  feed_forward: {
    ff_in_dim: number;
    ff_hidden_dim: number;
    neurons_active: number[][];
  };
  hidden_states: number[][];
  next_token_probs: {
    token: string;
    id: number;
    probability: number;
  }[];
  generated_text: string;
  estimated_cost_usd: number;
}

export interface StageData {
  stage: number;
  name: string;
  data: any;
}

export function useSimulation() {
  const { token } = useAuth();
  const [stagesData, setStagesData] = useState<Record<number, StageData>>({});
  const [currentActiveStage, setCurrentActiveStage] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);

  const startSimulation = (prompt: string, parameters: Record<string, any>) => {
    setLoading(true);
    setStreaming(true);
    setError(null);
    setStagesData({});
    setCurrentActiveStage(1);

    // Try WebSocket connection
    try {
      const wsUrl = `${WS_BASE_URL}/ws/simulation`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({ prompt, parameters }));
      };

      ws.onmessage = (event) => {
        const payload = JSON.parse(event.data);
        
        if (payload.error) {
          setError(payload.error);
          setLoading(false);
          setStreaming(false);
          return;
        }

        if (payload.type === 'stage_update') {
          const stageNum = payload.current_stage;
          setStagesData((prev) => ({
            ...prev,
            [stageNum]: {
              stage: stageNum,
              name: payload.stage_name,
              data: payload.data,
            },
          }));
          setCurrentActiveStage(stageNum);
        } else if (payload.type === 'simulation_complete') {
          setLoading(false);
          setStreaming(false);
          ws.close();
        }
      };

      ws.onerror = () => {
        // WebSocket error -> fallback to standard HTTP POST
        runHttpFallback(prompt, parameters);
      };

      ws.onclose = () => {
        setStreaming(false);
      };

    } catch (err) {
      runHttpFallback(prompt, parameters);
    }
  };

  const runHttpFallback = async (prompt: string, parameters: Record<string, any>) => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/simulate/run`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          prompt,
          ...parameters,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.detail || 'Simulation failed');
      }

      // Convert HTTP response into staged blocks for frontend to stream through
      const sim = result.simulation;
      
      const stagesList: StageData[] = [
        { stage: 1, name: "Input Processing", data: { text: sim.text, char_count: sim.char_count, word_count: sim.word_count } },
        { stage: 2, name: "Cleaning & Normalization", data: { cleaned: sim.text.toLowerCase().strip ? sim.text.toLowerCase().strip() : sim.text.toLowerCase() } },
        { stage: 3, name: "Tokenization", data: { tokens: sim.tokens, method: parameters.tokenization_method || 'BPE' } },
        { stage: 4, name: "Token IDs", data: { token_ids: sim.token_ids, vocabulary_sample: sim.tokens.map((t: any) => ({ id: t.id, token: t.text })) } },
        { stage: 5, name: "Embeddings Projection", data: { embeddings_slice: sim.embeddings.slice(0, 5), pca_coords: sim.pca_coords } },
        { stage: 6, name: "Positional Encoding", data: { encoding_slice: sim.positional_encoding.slice(0, 5), mode: parameters.positional_encoding || 'Sinusoidal' } },
        { stage: 7, name: "Transformer Blocks Flow", data: { num_layers: sim.num_layers } },
        { stage: 8, name: "Self Attention Weights", data: { attention_heads: sim.attention_heads, tokens: sim.tokens.map((t: any) => t.text) } },
        { stage: 9, name: "Feed Forward Networks", data: sim.feed_forward },
        { stage: 10, name: "Hidden States Outputs", data: { states_slice: sim.hidden_states.slice(0, 5) } },
        { stage: 11, name: "Next Token Prediction", data: { probabilities: sim.next_token_probs } },
        { stage: 12, name: "Output Generation", data: { generated_text: sim.generated_text } }
      ];

      // Stream the responses via timeout mock locally
      let currentIdx = 0;
      setLoading(true);
      
      const interval = setInterval(() => {
        if (currentIdx < stagesList.length) {
          const currentStage = stagesList[currentIdx];
          setStagesData((prev) => ({
            ...prev,
            [currentStage.stage]: currentStage
          }));
          setCurrentActiveStage(currentStage.stage);
          currentIdx++;
        } else {
          clearInterval(interval);
          setLoading(false);
          setStreaming(false);
        }
      }, 500);

    } catch (err: any) {
      setError(err.message || 'Failed to communicate with LLM Simulator');
      setLoading(false);
      setStreaming(false);
    }
  };

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return {
    stagesData,
    currentActiveStage,
    setCurrentActiveStage,
    startSimulation,
    loading,
    streaming,
    error,
  };
}

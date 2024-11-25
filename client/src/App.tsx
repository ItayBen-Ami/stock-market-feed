import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { useWebsocket } from './useWebsocket';
import { useSSE } from './useSSE';
import { Stock } from './types';
import StockMarketChart from './StockMarketChart';

const queryClient = new QueryClient();

function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <FeedData />
    </QueryClientProvider>
  )
}

function FeedData() {
  const {data: shortPollingStocksData = { stocks: [] }}  = useQuery({ 
    queryKey: ["stocks"], 
    queryFn: async () => fetch("http://localhost:3000/stocks").then((response) => response.json() as Promise<{stocks: Stock[]}>), 
    refetchInterval: 5 * 1000});

  const { value: websocketStockData } = useWebsocket<{stocks: Stock[]}>("ws://localhost:3000/stocks-ws", (value) => JSON.parse(value));

  const { value: sseStocksData } = useSSE<{stocks: Stock[]}>("http://localhost:3000/stocks-sse");

  if (!websocketStockData || !sseStocksData) return;

  return (
  <div className="flex gap-4 size-full justify-center items-center p-8">  
      <StockMarketChart stocks={shortPollingStocksData.stocks} title='Short Polling' subtitle='Refetch interval of 5 seconds'/>
      <StockMarketChart stocks={websocketStockData.stocks} title='WebSockets'/>
      <StockMarketChart stocks={sseStocksData.stocks} title='SSE'/>
  </div>
  )
}

export default App

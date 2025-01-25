import React, { useState } from 'react';
import { VStack, Button } from '@chakra-ui/react';
import Quiz from './components/Quiz';
import History from './components/History';

export default function App() {
  const [screen, setScreen] = useState('menu');

  return (
    <VStack minH="100vh" justify="center" spacing={4} p={4}>
      {screen === 'menu' && (
        <>
          <Button colorScheme="blue" onClick={() => setScreen('quiz')}>
            Новая викторина
          </Button>
          <Button colorScheme="green" onClick={() => setScreen('history')}>
            История
          </Button>
        </>
      )}
      {screen === 'quiz' && <Quiz onFinish={() => setScreen('menu')} />}
      {screen === 'history' && <History onBack={() => setScreen('menu')} />}
    </VStack>
  );
}

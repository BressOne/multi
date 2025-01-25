import React from 'react';
import { VStack, Text, Button, Box } from '@chakra-ui/react';

function getResultsFromLocalStorage() {
    return JSON.parse(localStorage.getItem('quizHistory') || '[]');
}

function getFrequentMistakes(history) {
    const mistakeCounts = {};

    history.forEach((quiz) => {
        quiz.answers.forEach(({ question, isCorrect }) => {
            if (!isCorrect) {
                mistakeCounts[question] = (mistakeCounts[question] || 0) + 1;
            }
        });
    });

    return Object.entries(mistakeCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([key, count]) => `${key.split(',').join(' × ')}: ${count} ошибок`);
}

export default function History({ onBack }) {
    const history = getResultsFromLocalStorage();
    const mistakes = getFrequentMistakes(history);

    return (
        <VStack spacing={4}>
            <Button onClick={onBack} colorScheme="blue">
                Назад
            </Button>
            {history.length === 0 ? (
                <Text>История пуста</Text>
            ) : (
                history.map((quiz, index) => (
                    <Box key={index} borderWidth="1px" borderRadius="md" p={4} w="100%">
                        <Text>Дата: {new Date(quiz.timestamp).toLocaleString()}</Text>
                        <Text>Правильно: {quiz.answers.filter((a) => a.isCorrect).length}</Text>
                        <Text>Ошибок: {quiz.answers.filter((a) => !a.isCorrect).length}</Text>
                        <Box mt={2}>
                            <Text fontWeight="bold">Ошибки:</Text>
                            {quiz.answers
                                .filter((a) => !a.isCorrect)
                                .map((answer, idx) => (
                                    <Text key={idx}>
                                        {answer.question.split(',').join(' × ')} (Ваш ответ: {answer.userAnswer}, Правильный ответ: {answer.correctAnswer})
                                    </Text>
                                ))}
                        </Box>
                    </Box>
                ))
            )}
            {mistakes.length > 0 && (
                <Box borderWidth="1px" borderRadius="md" p={4} w="100%">
                    <Text fontWeight="bold">Частые ошибки:</Text>
                    {mistakes.map((mistake, index) => (
                        <Text key={index}>{mistake}</Text>
                    ))}
                </Box>
            )}
            {history.length != 0
                &&
                <>
                    <Button onClick={() => { localStorage.removeItem('quizHistory'); onBack() }} colorScheme="red">
                        Очистить историю
                    </Button>
                    <Button onClick={onBack} colorScheme="blue">
                        Назад
                    </Button>
                </>
            }
        </VStack>
    );
}

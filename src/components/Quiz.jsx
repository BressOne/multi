import React, { useEffect, useState } from 'react';
import { VStack, Text, Button, Input, Box } from '@chakra-ui/react';

function getHistory() {
    const history = JSON.parse(localStorage.getItem('quizHistory') || '[]');
    return history;
}

function saveToHistory(result) {
    const history = getHistory();
    history.push(result);
    localStorage.setItem('quizHistory', JSON.stringify(history));
}

function getFrequentMistake() {
    const history = getHistory();
    const mistakeCounts = {};

    history.forEach((quiz) => {
        quiz.answers.forEach(({ question, isCorrect }) => {
            if (!isCorrect) {
                mistakeCounts[question] = (mistakeCounts[question] || 0) + 1;
            }
        });
    });

    const sortedMistakes = Object.entries(mistakeCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([key]) => key);

    for (let mistake of sortedMistakes) {
        const recentCorrect = history.slice(-2).every((quiz) =>
            quiz.answers.some(
                (answer) => answer.question === mistake && answer.isCorrect
            )
        );
        if (!recentCorrect) {
            const [a, b] = mistake.split(',').map(Number);
            return { a, b };
        }
    }

    return null;
}

function generateQuestions() {
    const questions = [];
    const usedPairs = new Set();

    const frequentMistake = getFrequentMistake();
    if (frequentMistake) {
        questions.push({ ...frequentMistake, id: `${frequentMistake.a},${frequentMistake.b}` });
        usedPairs.add(`${frequentMistake.a},${frequentMistake.b}`);
    }

    while (questions.length < 10) {
        const a = 1 + Math.ceil(Math.random() * 8);
        const b = 1 + Math.ceil(Math.random() * 8);
        const pair = `${a},${b}`;
        const mirrorPair = `${b},${a}`;

        if (!usedPairs.has(pair) && !usedPairs.has(mirrorPair)) {
            usedPairs.add(pair);
            questions.push({ a, b, id: pair });
        }
    }

    return questions;
}

export default function Quiz({ onFinish }) {
    const [questions] = useState(generateQuestions());
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [input, setInput] = useState('');
    const [answers, setAnswers] = useState([]);
    const [showResults, setShowResults] = useState(false);

    const currentQuestion = questions[currentIndex];

    useEffect(() => {
        if (showResults) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    handleNext();
                    return 30;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [currentIndex, showResults]);

    const handleNext = () => {
        const isCorrect = parseInt(input) === currentQuestion.a * currentQuestion.b;
        setAnswers((prev) => [
            ...prev,
            {
                question: `${currentQuestion.a},${currentQuestion.b}`,
                userAnswer: parseInt(input),
                correctAnswer: currentQuestion.a * currentQuestion.b,
                isCorrect,
            },
        ]);

        setInput('');
        setTimeLeft(30);

        if (currentIndex + 1 < questions.length) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setShowResults(true);
        }
    };

    const handleFinish = () => {
        const result = {
            timestamp: new Date().toISOString(),
            answers,
        };
        saveToHistory(result);
        onFinish();
    };

    if (showResults) {
        return (
            <VStack spacing={4}>
                <Text fontSize="2xl">Результаты</Text>
                {answers.map(({ question, userAnswer, correctAnswer, isCorrect }, idx) => (
                    <Box key={idx} p={4} borderWidth="1px" borderRadius="md" w="100%">
                        <Text>
                            Вопрос: {question.split(',').join(' × ')}
                        </Text>
                        <Text>
                            Ваш ответ: {isNaN(userAnswer) ? 'не был дан' : userAnswer} ({isCorrect ? 'Правильно' : 'Неправильно'})
                        </Text>
                        {!isCorrect && <Text>Правильный ответ: {correctAnswer}</Text>}
                    </Box>
                ))}
                <Button onClick={handleFinish} colorScheme="blue">
                    Завершить
                </Button>
            </VStack>
        );
    }

    return (
        <VStack spacing={4}>
            <Text fontSize="2xl">Сколько будет {currentQuestion.a} × {currentQuestion.b}?</Text>
            <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ваш ответ"
                type="number"
            />
            <Button onClick={handleNext} colorScheme="blue">
                Далее
            </Button>
            <Box>
                <Text>Осталось времени: {timeLeft} секунд</Text>
            </Box>
        </VStack>
    );
}

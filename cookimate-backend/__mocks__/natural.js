// __mocks__/natural.js
export default {
    SentimentAnalyzer: class {
        getSentiment() {
            return 0;
        }
    },
    PorterStemmer: {
        stem: (word) => word
    },
    WordTokenizer: class {
        tokenize(text) {
            return text.split(' ');
        }
    }
};
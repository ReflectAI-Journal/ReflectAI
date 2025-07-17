"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiKey = void 0;
const openai_1 = __importDefault(require("openai"));
// This is the code the user wanted to implement
// Implementing exactly as provided, adapting to TypeScript
exports.apiKey = process.env.OPENAI_API_KEY || '';
// Create the OpenAI client with the API key
const openai = new openai_1.default({
    apiKey: exports.apiKey
});
exports.default = openai;

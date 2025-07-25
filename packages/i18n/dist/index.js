"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.t = t;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let translations = {};
function loadTranslations() {
    const lang = process.env.STACKCODE_LANG || 'en';
    // __dirname pode não estar disponível em todos os contextos de módulo,
    // mas para nosso build CommonJS, ele funciona.
    const localesDir = path.resolve(__dirname, 'locales');
    const filePath = path.join(localesDir, `${lang}.json`);
    try {
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            translations = JSON.parse(fileContent);
        }
        else {
            const fallbackPath = path.join(localesDir, 'en.json');
            const fileContent = fs.readFileSync(fallbackPath, 'utf-8');
            translations = JSON.parse(fileContent);
        }
    }
    catch (error) {
        console.error('Failed to load translation files.', error);
        translations = {};
    }
}
function t(key) {
    const keys = key.split('.');
    let result = translations;
    for (const k of keys) {
        if (result && typeof result === 'object' && k in result) {
            result = result[k];
        }
        else {
            return key;
        }
    }
    return typeof result === 'string' ? result : key;
}
loadTranslations();

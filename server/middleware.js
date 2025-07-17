"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.middleware = void 0;
exports.middleware = middleware;
// middleware.ts
const server_1 = require("next/server");
const auth_1 = require("@/app/auth");
var auth_2 = require("@/app/auth");
Object.defineProperty(exports, "middleware", { enumerable: true, get: function () { return auth_2.auth; } });
exports.config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)'
    ]
};
const actions_1 = require("@/app/actions");
function middleware(request) {
    return __awaiter(this, void 0, void 0, function* () {
        const session = yield (0, auth_1.auth)(request);
        if (!session) {
            return server_1.NextResponse.redirect(new URL('/auth/signin', request.url));
        }
        const subscriptions = yield (0, actions_1.getUserSubscriptions)();
        if (!subscriptions.length) {
            return server_1.NextResponse.redirect(new URL('/dashboard/billing', request.url));
        }
        return server_1.NextResponse.next();
    });
}

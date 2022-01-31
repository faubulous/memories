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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.VirtualTimelineDataSource = void 0;
var rxjs_1 = require("rxjs");
var DatabaseChannel_1 = require("../../electron/IPC/DatabaseChannel");
var IpcService_1 = require("../../shared/IpcService");
var VirtualTimelineDataSource = /** @class */ (function () {
    function VirtualTimelineDataSource() {
        this.length = 0;
        this._dataCache = new Array(this.length);
        this.data$ = new rxjs_1.BehaviorSubject(this._dataCache);
        this._pageSize = 10;
        this._loadRange$ = new rxjs_1.BehaviorSubject({ start: 0, end: 0 });
        this._loadedPages = new Set();
        this._ipc = new IpcService_1.IpcService();
    }
    VirtualTimelineDataSource.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, new IpcService_1.IpcService().send(new DatabaseChannel_1.InitFilesRequest())];
                    case 1:
                        result = _a.sent();
                        this.length = result.data.length;
                        this._dataCache = __spreadArray([], result.data, true);
                        this.data$.next(this._dataCache);
                        this._loadRange$.pipe((0, rxjs_1.debounceTime)(10), (0, rxjs_1.distinctUntilChanged)(function (a, b) { return a.start === b.start && a.end == b.end; })).subscribe(function (range) { return __awaiter(_this, void 0, void 0, function () {
                            var n;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        n = range.start;
                                        _a.label = 1;
                                    case 1:
                                        if (!(n <= range.end)) return [3 /*break*/, 4];
                                        return [4 /*yield*/, this._loadPage(n)];
                                    case 2:
                                        _a.sent();
                                        _a.label = 3;
                                    case 3:
                                        n++;
                                        return [3 /*break*/, 1];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); });
                        if (!(this.length > 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._loadPage(0)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    VirtualTimelineDataSource.prototype._getPageForIndex = function (index) {
        return Math.floor(index / this._pageSize);
    };
    VirtualTimelineDataSource.prototype.loadRange = function (range) {
        return __awaiter(this, void 0, void 0, function () {
            var start, end;
            return __generator(this, function (_a) {
                start = this._getPageForIndex(range.start);
                end = this._getPageForIndex(range.end);
                this._loadRange$.next({ start: start, end: end });
                return [2 /*return*/];
            });
        });
    };
    VirtualTimelineDataSource.prototype._loadPage = function (n) {
        return __awaiter(this, void 0, void 0, function () {
            var skip, take, result, thumbnails;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this._loadedPages.has(n)) {
                            return [2 /*return*/];
                        }
                        this._loadedPages.add(n);
                        skip = this._pageSize * n;
                        take = this._pageSize;
                        return [4 /*yield*/, this._ipc.send(new DatabaseChannel_1.GetFilesRequest(skip, take))];
                    case 1:
                        result = _a.sent();
                        thumbnails = new Array(result.files.length);
                        result.files.forEach(function (f, m) {
                            var _a;
                            if (f.thumbnail) {
                                var image_1 = new Image();
                                image_1.onload = function () {
                                    var _a;
                                    thumbnails.splice(m, 1, {
                                        id: f.id,
                                        type: f.type,
                                        dateModified: f.dateModified,
                                        image: image_1
                                    });
                                    if (thumbnails.length == result.files.length) {
                                        (_a = _this._dataCache).splice.apply(_a, __spreadArray([skip, take], thumbnails, false));
                                        _this.data$.next(_this._dataCache);
                                    }
                                };
                                image_1.src = f.thumbnail;
                            }
                            else {
                                thumbnails.splice(m, 1, {
                                    id: f.id,
                                    type: f.type,
                                    image: null
                                });
                                if (thumbnails.length == result.files.length) {
                                    (_a = _this._dataCache).splice.apply(_a, __spreadArray([skip, take], thumbnails, false));
                                    _this.data$.next(_this._dataCache);
                                }
                            }
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    return VirtualTimelineDataSource;
}());
exports.VirtualTimelineDataSource = VirtualTimelineDataSource;

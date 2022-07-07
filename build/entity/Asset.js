"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const Message_1 = require("./Message");
const Assignment_1 = require("./Assignment");
let Asset = class Asset extends typeorm_1.BaseEntity {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Asset.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", Number)
], Asset.prototype, "message_id", void 0);
__decorate([
    typeorm_1.ManyToOne((_) => Message_1.Message, (message) => message.id, { nullable: true }),
    typeorm_1.JoinColumn({ name: "message_id" }),
    __metadata("design:type", Message_1.Message)
], Asset.prototype, "message", void 0);
__decorate([
    typeorm_1.Column({ nullable: false }),
    __metadata("design:type", Number)
], Asset.prototype, "assignment_id", void 0);
__decorate([
    typeorm_1.ManyToOne((_) => Assignment_1.Assignment, (assignment) => assignment.id, {
        nullable: false,
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    }),
    typeorm_1.JoinColumn({ name: "assignment_id" }),
    __metadata("design:type", Assignment_1.Assignment)
], Asset.prototype, "assignment", void 0);
__decorate([
    typeorm_1.Column({
        type: "text",
        nullable: true,
    }),
    __metadata("design:type", String)
], Asset.prototype, "path", void 0);
__decorate([
    typeorm_1.Column({
        type: "text",
        nullable: false,
    }),
    __metadata("design:type", String)
], Asset.prototype, "name", void 0);
__decorate([
    typeorm_1.Column({
        type: "text",
        nullable: false,
    }),
    __metadata("design:type", String)
], Asset.prototype, "extension", void 0);
__decorate([
    typeorm_1.Column({
        type: "text",
        nullable: false,
    }),
    __metadata("design:type", String)
], Asset.prototype, "url", void 0);
__decorate([
    typeorm_1.CreateDateColumn({
        type: "datetime",
    }),
    __metadata("design:type", Date)
], Asset.prototype, "created_at", void 0);
__decorate([
    typeorm_1.UpdateDateColumn({
        type: "datetime",
    }),
    __metadata("design:type", Date)
], Asset.prototype, "updated_at", void 0);
Asset = __decorate([
    typeorm_1.Entity("Asset")
], Asset);
exports.Asset = Asset;
//# sourceMappingURL=Asset.js.map
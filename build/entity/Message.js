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
const Student_1 = require("./Student");
const Assignment_1 = require("./Assignment");
const Milestone_1 = require("./Milestone");
let Message = class Message extends typeorm_1.BaseEntity {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Message.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({
        type: "text",
        nullable: false,
    }),
    __metadata("design:type", String)
], Message.prototype, "text", void 0);
__decorate([
    typeorm_1.Column({ nullable: false }),
    __metadata("design:type", String)
], Message.prototype, "sender_id", void 0);
__decorate([
    typeorm_1.ManyToOne((_) => Student_1.Student, (student) => student.id, {
        nullable: false,
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    }),
    typeorm_1.JoinColumn({ name: "sender_id" }),
    __metadata("design:type", Student_1.Student)
], Message.prototype, "sender", void 0);
__decorate([
    typeorm_1.Column({ nullable: false }),
    __metadata("design:type", String)
], Message.prototype, "recipient_id", void 0);
__decorate([
    typeorm_1.ManyToOne((_) => Student_1.Student, (student) => student.id, {
        nullable: false,
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    }),
    typeorm_1.JoinColumn({ name: "recipient_id" }),
    __metadata("design:type", Student_1.Student)
], Message.prototype, "recipient", void 0);
__decorate([
    typeorm_1.Column({ nullable: false }),
    __metadata("design:type", String)
], Message.prototype, "assignment_id", void 0);
__decorate([
    typeorm_1.ManyToOne((_) => Assignment_1.Assignment, (assignment) => assignment.id, {
        nullable: false,
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    }),
    typeorm_1.JoinColumn({ name: "assignment_id" }),
    __metadata("design:type", Assignment_1.Assignment)
], Message.prototype, "assignment", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", Number)
], Message.prototype, "wait_for_completion", void 0);
__decorate([
    typeorm_1.ManyToOne((_) => Milestone_1.Milestone, (milestone) => milestone.id, {
        nullable: true,
    }),
    typeorm_1.JoinColumn({ name: "wait_for_completion" }),
    __metadata("design:type", Milestone_1.Milestone)
], Message.prototype, "milestone", void 0);
__decorate([
    typeorm_1.CreateDateColumn({
        type: "datetime",
    }),
    __metadata("design:type", Date)
], Message.prototype, "created_at", void 0);
__decorate([
    typeorm_1.UpdateDateColumn({
        type: "datetime",
    }),
    __metadata("design:type", Date)
], Message.prototype, "updated_at", void 0);
Message = __decorate([
    typeorm_1.Entity("Message")
], Message);
exports.Message = Message;
//# sourceMappingURL=Message.js.map
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
const Helper_1 = require("./Helper");
const Milestone_1 = require("./Milestone");
let Payment = class Payment extends typeorm_1.BaseEntity {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Payment.prototype, "id", void 0);
__decorate([
    typeorm_1.ManyToOne((_) => Student_1.Student, (student) => student.id, {
        nullable: true,
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    }),
    typeorm_1.JoinColumn({ name: "student_id" }),
    __metadata("design:type", Student_1.Student)
], Payment.prototype, "student", void 0);
__decorate([
    typeorm_1.Column({ nullable: false }),
    __metadata("design:type", String)
], Payment.prototype, "student_id", void 0);
__decorate([
    typeorm_1.ManyToOne((_) => Helper_1.Helper, (helper) => helper.id, {
        nullable: false,
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    }),
    typeorm_1.JoinColumn({ name: "helper_id" }),
    __metadata("design:type", Helper_1.Helper)
], Payment.prototype, "helper", void 0);
__decorate([
    typeorm_1.Column({ nullable: false }),
    __metadata("design:type", String)
], Payment.prototype, "helper_id", void 0);
__decorate([
    typeorm_1.OneToOne((_) => Milestone_1.Milestone, (milestone) => milestone.id, { nullable: false }),
    typeorm_1.JoinColumn({ name: "milestone_id" }),
    __metadata("design:type", Milestone_1.Milestone)
], Payment.prototype, "milestone", void 0);
__decorate([
    typeorm_1.Column({ nullable: false }),
    __metadata("design:type", Number)
], Payment.prototype, "milestone_id", void 0);
__decorate([
    typeorm_1.Column({
        type: "decimal",
        nullable: false,
        scale: 2,
        precision: 10,
    }),
    __metadata("design:type", Number)
], Payment.prototype, "amount", void 0);
__decorate([
    typeorm_1.Column({
        type: "boolean",
        nullable: false,
    }),
    __metadata("design:type", Boolean)
], Payment.prototype, "pending", void 0);
__decorate([
    typeorm_1.CreateDateColumn({
        type: "datetime",
    }),
    __metadata("design:type", Date)
], Payment.prototype, "created_at", void 0);
__decorate([
    typeorm_1.UpdateDateColumn({
        type: "datetime",
    }),
    __metadata("design:type", Date)
], Payment.prototype, "updated_at", void 0);
Payment = __decorate([
    typeorm_1.Entity("Payment")
], Payment);
exports.Payment = Payment;
//# sourceMappingURL=Payment.js.map
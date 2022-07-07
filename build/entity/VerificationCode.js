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
// TODO: Add an expiration field to verification code table
let VerificationCode = class VerificationCode extends typeorm_1.BaseEntity {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], VerificationCode.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({
        type: "varchar",
        length: 6,
        nullable: false,
    }),
    __metadata("design:type", String)
], VerificationCode.prototype, "code", void 0);
__decorate([
    typeorm_1.Column({ nullable: false }),
    __metadata("design:type", String)
], VerificationCode.prototype, "student_id", void 0);
__decorate([
    typeorm_1.OneToOne((_) => Student_1.Student, (student) => student.id, {
        nullable: false,
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    }),
    typeorm_1.JoinColumn({ name: "student_id" }),
    __metadata("design:type", Student_1.Student)
], VerificationCode.prototype, "student", void 0);
__decorate([
    typeorm_1.CreateDateColumn({
        type: "datetime",
    }),
    __metadata("design:type", Date)
], VerificationCode.prototype, "created_at", void 0);
__decorate([
    typeorm_1.UpdateDateColumn({
        type: "datetime",
    }),
    __metadata("design:type", Date)
], VerificationCode.prototype, "updated_at", void 0);
VerificationCode = __decorate([
    typeorm_1.Entity("VerificationCode")
], VerificationCode);
exports.VerificationCode = VerificationCode;
//# sourceMappingURL=VerificationCode.js.map
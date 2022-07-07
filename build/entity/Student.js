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
const College_1 = require("./College");
let Student = class Student extends typeorm_1.BaseEntity {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn("uuid"),
    __metadata("design:type", String)
], Student.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({
        type: "varchar",
        nullable: false,
        length: 320,
        unique: true,
    }),
    __metadata("design:type", String)
], Student.prototype, "email", void 0);
__decorate([
    typeorm_1.Column({
        type: "text",
        nullable: false,
    }),
    __metadata("design:type", String)
], Student.prototype, "password", void 0);
__decorate([
    typeorm_1.Column({
        type: "boolean",
        nullable: false,
    }),
    __metadata("design:type", Boolean)
], Student.prototype, "verified", void 0);
__decorate([
    typeorm_1.Column({
        type: "text",
        nullable: false,
    }),
    __metadata("design:type", String)
], Student.prototype, "username", void 0);
__decorate([
    typeorm_1.Column({ nullable: false }),
    __metadata("design:type", String)
], Student.prototype, "college_id", void 0);
__decorate([
    typeorm_1.ManyToOne((_) => College_1.College, (college) => college.id, { nullable: false }),
    typeorm_1.JoinColumn({ name: "college_id" }),
    __metadata("design:type", College_1.College)
], Student.prototype, "college", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }) //TODO: Make this false
    ,
    __metadata("design:type", String)
], Student.prototype, "stripe_id", void 0);
__decorate([
    typeorm_1.Column({
        type: "boolean",
        nullable: true,
    }),
    __metadata("design:type", Boolean)
], Student.prototype, "payouts_enabled", void 0);
__decorate([
    typeorm_1.CreateDateColumn({
        type: "datetime",
    }),
    __metadata("design:type", Date)
], Student.prototype, "created_at", void 0);
__decorate([
    typeorm_1.UpdateDateColumn({
        type: "datetime",
    }),
    __metadata("design:type", Date)
], Student.prototype, "updated_at", void 0);
Student = __decorate([
    typeorm_1.Entity("Student")
], Student);
exports.Student = Student;
//# sourceMappingURL=Student.js.map
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
const Course_1 = require("./Course");
const College_1 = require("./College");
let Assignment = class Assignment extends typeorm_1.BaseEntity {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Assignment.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({
        type: "text",
        nullable: false,
    }),
    __metadata("design:type", String)
], Assignment.prototype, "name", void 0);
__decorate([
    typeorm_1.Column({
        type: "text",
        nullable: false,
    }),
    __metadata("design:type", String)
], Assignment.prototype, "description", void 0);
__decorate([
    typeorm_1.Column({ nullable: false }),
    __metadata("design:type", String)
], Assignment.prototype, "creator_id", void 0);
__decorate([
    typeorm_1.ManyToOne((_) => Student_1.Student, (student) => student.id, {
        nullable: false,
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    }),
    typeorm_1.JoinColumn({ name: "creator_id" }),
    __metadata("design:type", Student_1.Student)
], Assignment.prototype, "creator", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", String)
], Assignment.prototype, "helper_id", void 0);
__decorate([
    typeorm_1.ManyToOne((_) => Helper_1.Helper, (helper) => helper.id, {
        nullable: true,
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    }),
    typeorm_1.JoinColumn({ name: "helper_id" }),
    __metadata("design:type", Helper_1.Helper)
], Assignment.prototype, "helper", void 0);
__decorate([
    typeorm_1.Column({ nullable: false }),
    __metadata("design:type", Number)
], Assignment.prototype, "course_id", void 0);
__decorate([
    typeorm_1.ManyToOne((_) => Course_1.Course, (course) => course.id, { nullable: false }),
    typeorm_1.JoinColumn({ name: "course_id" }),
    __metadata("design:type", Course_1.Course)
], Assignment.prototype, "course", void 0);
__decorate([
    typeorm_1.Column({ nullable: false }),
    __metadata("design:type", Number)
], Assignment.prototype, "college_id", void 0);
__decorate([
    typeorm_1.ManyToOne((_) => College_1.College, (college) => college.id, { nullable: false }),
    typeorm_1.JoinColumn({ name: "college_id" }),
    __metadata("design:type", College_1.College)
], Assignment.prototype, "college", void 0);
__decorate([
    typeorm_1.Column({
        type: "datetime",
        nullable: false,
    }),
    __metadata("design:type", Date)
], Assignment.prototype, "accept_by", void 0);
__decorate([
    typeorm_1.Column({
        type: "boolean",
        nullable: false,
    }),
    __metadata("design:type", Boolean)
], Assignment.prototype, "active", void 0);
__decorate([
    typeorm_1.CreateDateColumn({
        type: "datetime",
    }),
    __metadata("design:type", Date)
], Assignment.prototype, "created_at", void 0);
__decorate([
    typeorm_1.UpdateDateColumn({
        type: "datetime",
    }),
    __metadata("design:type", Date)
], Assignment.prototype, "updated_at", void 0);
Assignment = __decorate([
    typeorm_1.Entity("Assignment")
], Assignment);
exports.Assignment = Assignment;
//# sourceMappingURL=Assignment.js.map
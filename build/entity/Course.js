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
let Course = class Course extends typeorm_1.BaseEntity {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Course.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({
        type: "text",
        nullable: false,
    }),
    __metadata("design:type", String)
], Course.prototype, "department", void 0);
__decorate([
    typeorm_1.ManyToOne((_) => College_1.College, (college) => college.id, { nullable: false }),
    typeorm_1.JoinColumn({ name: "college_id" }),
    __metadata("design:type", College_1.College)
], Course.prototype, "college", void 0);
__decorate([
    typeorm_1.Column({
        type: "text",
        nullable: false,
    }),
    __metadata("design:type", String)
], Course.prototype, "name", void 0);
__decorate([
    typeorm_1.Column({
        type: "int",
        nullable: false,
    }),
    __metadata("design:type", Number)
], Course.prototype, "course_no", void 0);
__decorate([
    typeorm_1.CreateDateColumn({
        type: "datetime",
    }),
    __metadata("design:type", Date)
], Course.prototype, "created_at", void 0);
__decorate([
    typeorm_1.UpdateDateColumn({
        type: "datetime",
    }),
    __metadata("design:type", Date)
], Course.prototype, "updated_at", void 0);
Course = __decorate([
    typeorm_1.Entity("Course")
], Course);
exports.Course = Course;
//# sourceMappingURL=Course.js.map
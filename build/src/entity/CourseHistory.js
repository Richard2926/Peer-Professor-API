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
const Helper_1 = require("./Helper");
const Course_1 = require("./Course");
let CourseHistory = class CourseHistory extends typeorm_1.BaseEntity {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], CourseHistory.prototype, "id", void 0);
__decorate([
    typeorm_1.ManyToOne((_) => Helper_1.Helper, (helper) => helper.id, {
        nullable: false,
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    }),
    typeorm_1.JoinColumn({ name: "helper_id" }),
    __metadata("design:type", Helper_1.Helper)
], CourseHistory.prototype, "helper", void 0);
__decorate([
    typeorm_1.ManyToOne((_) => Course_1.Course, (course) => course.id, { nullable: false }),
    typeorm_1.JoinColumn({ name: "course_id" }),
    __metadata("design:type", Course_1.Course)
], CourseHistory.prototype, "course", void 0);
__decorate([
    typeorm_1.CreateDateColumn({
        type: "datetime",
    }),
    __metadata("design:type", Date)
], CourseHistory.prototype, "created_at", void 0);
__decorate([
    typeorm_1.UpdateDateColumn({
        type: "datetime",
    }),
    __metadata("design:type", Date)
], CourseHistory.prototype, "updated_at", void 0);
CourseHistory = __decorate([
    typeorm_1.Entity("CourseHistory")
], CourseHistory);
exports.CourseHistory = CourseHistory;
//# sourceMappingURL=CourseHistory.js.map
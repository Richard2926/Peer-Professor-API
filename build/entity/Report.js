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
const ReportType_1 = require("./ReportType");
const Student_1 = require("./Student");
let Report = class Report extends typeorm_1.BaseEntity {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Report.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({ nullable: false }),
    __metadata("design:type", String)
], Report.prototype, "from_student_id", void 0);
__decorate([
    typeorm_1.ManyToOne((_) => Student_1.Student, (student) => student.id, {
        nullable: false,
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    }),
    typeorm_1.JoinColumn({ name: "from_student_id" }),
    __metadata("design:type", Student_1.Student)
], Report.prototype, "student1", void 0);
__decorate([
    typeorm_1.Column({ nullable: false }),
    __metadata("design:type", String)
], Report.prototype, "to_student_id", void 0);
__decorate([
    typeorm_1.ManyToOne((_) => Student_1.Student, (student) => student.id, {
        nullable: true,
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    }),
    typeorm_1.JoinColumn({ name: "to_student_id" }),
    __metadata("design:type", Student_1.Student)
], Report.prototype, "student2", void 0);
__decorate([
    typeorm_1.Column({ nullable: false }),
    __metadata("design:type", Number)
], Report.prototype, "report_type", void 0);
__decorate([
    typeorm_1.ManyToOne((_) => ReportType_1.ReportType, (report) => report.id, { nullable: false }),
    typeorm_1.JoinColumn({ name: "report_type" }),
    __metadata("design:type", ReportType_1.ReportType)
], Report.prototype, "reportType", void 0);
__decorate([
    typeorm_1.Column({
        type: "text",
        nullable: false,
    }),
    __metadata("design:type", String)
], Report.prototype, "text", void 0);
__decorate([
    typeorm_1.Column({
        type: "text",
        nullable: true,
    }),
    __metadata("design:type", String)
], Report.prototype, "investigator_notes", void 0);
__decorate([
    typeorm_1.Column({
        type: "boolean",
        nullable: false,
    }),
    __metadata("design:type", Boolean)
], Report.prototype, "active", void 0);
__decorate([
    typeorm_1.CreateDateColumn({
        type: "datetime",
    }),
    __metadata("design:type", Date)
], Report.prototype, "created_at", void 0);
__decorate([
    typeorm_1.UpdateDateColumn({
        type: "datetime",
    }),
    __metadata("design:type", Date)
], Report.prototype, "updated_at", void 0);
Report = __decorate([
    typeorm_1.Entity("Report")
], Report);
exports.Report = Report;
//# sourceMappingURL=Report.js.map
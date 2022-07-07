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
const Assignment_1 = require("./Assignment");
let Milestone = class Milestone extends typeorm_1.BaseEntity {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Milestone.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({ nullable: false }),
    __metadata("design:type", Number)
], Milestone.prototype, "assignment_id", void 0);
__decorate([
    typeorm_1.ManyToOne((_) => Assignment_1.Assignment, (assignment) => assignment.id, {
        nullable: false,
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    }),
    typeorm_1.JoinColumn({ name: "assignment_id" }),
    __metadata("design:type", Assignment_1.Assignment)
], Milestone.prototype, "assignment", void 0);
__decorate([
    typeorm_1.Column({
        type: "decimal",
        nullable: false,
        scale: 2,
        precision: 10,
    }),
    __metadata("design:type", Number)
], Milestone.prototype, "price", void 0);
__decorate([
    typeorm_1.Column({
        type: "text",
        nullable: false,
    }),
    __metadata("design:type", String)
], Milestone.prototype, "title", void 0);
__decorate([
    typeorm_1.Column({
        type: "text",
        nullable: false,
    }),
    __metadata("design:type", String)
], Milestone.prototype, "description", void 0);
__decorate([
    typeorm_1.Column({
        type: "datetime",
        nullable: false,
    }),
    __metadata("design:type", Date)
], Milestone.prototype, "deadline", void 0);
__decorate([
    typeorm_1.Column({
        type: "boolean",
        nullable: false,
    }),
    __metadata("design:type", Boolean)
], Milestone.prototype, "completed", void 0);
__decorate([
    typeorm_1.CreateDateColumn({
        type: "datetime",
    }),
    __metadata("design:type", Date)
], Milestone.prototype, "created_at", void 0);
__decorate([
    typeorm_1.UpdateDateColumn({
        type: "datetime",
    }),
    __metadata("design:type", Date)
], Milestone.prototype, "updated_at", void 0);
Milestone = __decorate([
    typeorm_1.Entity("Milestone")
], Milestone);
exports.Milestone = Milestone;
//# sourceMappingURL=Milestone.js.map
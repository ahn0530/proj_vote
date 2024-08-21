import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Participation } from '../participation/participation.entity';

export enum BudgetCategory {
  HEALTH_WELFARE_EMPLOYMENT = '보건•복지•고용',
  GENERAL_LOCAL_ADMIN = '일반•지방행정',
  EDUCATION = '교육',
  DEFENSE = '국방',
  INDUSTRY_SME_ENERGY = '산업•중소기업•에너지',
  RND = 'R&D',
  SOC = 'SOC',
  AGRICULTURE_FISHERY_FOOD = '농림•수산•식품',
  PUBLIC_ORDER_SAFETY = '공공질서•안전',
  ENVIRONMENT = '환경',
  CULTURE_SPORTS_TOURISM = '문화•체육•관광',
  DIPLOMACY_UNIFICATION = '외교•통일'
}

@Entity()
export class BudgetItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: BudgetCategory,
    unique: true
  })
  category: BudgetCategory;

  @ManyToOne(() => Participation, participation => participation.budgets)
  participation: Participation;
}
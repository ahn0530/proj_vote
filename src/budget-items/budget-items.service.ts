import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BudgetItem, BudgetCategory } from './budget-item.entity';

@Injectable()
export class BudgetItemsService {
  constructor(
    @InjectRepository(BudgetItem)
    private budgetItemRepository: Repository<BudgetItem>,
  ) {}

  async onModuleInit() {
    await this.initializeBudgetItems();
  }

  private async initializeBudgetItems(): Promise<void> {
    const categories = Object.values(BudgetCategory);
    for (const category of categories) {
      const existingItem = await this.budgetItemRepository.findOne({ where: { category } });
      if (!existingItem) {
        const newItem = this.budgetItemRepository.create({ category });
        await this.budgetItemRepository.save(newItem);
      }
    }
  }

  async getAllBudgetItems(): Promise<BudgetItem[]> {
    return this.budgetItemRepository.find();
  }

  async getBudgetCategories(): Promise<BudgetCategory[]> {
    return Object.values(BudgetCategory);
  }

  async createBudgetItem(category: BudgetCategory, participationId: number): Promise<BudgetItem> {
    const budgetItem = this.budgetItemRepository.create({ 
      category,
      participation: { id: participationId }
    });
    return this.budgetItemRepository.save(budgetItem);
  }

  async updateBudgetItem(category: BudgetCategory): Promise<BudgetItem> {
    const budgetItem = await this.budgetItemRepository.findOne({ where: { category } });
    if (!budgetItem) {
      throw new Error('Budget item not found');
    }
    return this.budgetItemRepository.save(budgetItem);
  }
  

  async getAllBudgetItemsWithDescription(): Promise<Array<BudgetItem & { description: string }>> {
    const budgetItems = await this.budgetItemRepository.find();
    return budgetItems.map(item => ({
      ...item,
      description: this.getBudgetItemDescription(item.category)
    }));
  }

  private getBudgetItemDescription(category: BudgetCategory): string {
    const descriptions = {
      [BudgetCategory.HEALTH_WELFARE_EMPLOYMENT]: '국민의 건강과 복지 증진, 일자리 창출을 위한 예산',
      [BudgetCategory.GENERAL_LOCAL_ADMIN]: '정부와 지방자치단체의 운영 및 행정 서비스 제공을 위한 예산',
      [BudgetCategory.EDUCATION]: '초중고 및 대학 교육, 평생교육 등 교육 분야 전반에 대한 예산',
      [BudgetCategory.DEFENSE]: '국가 안보와 군사력 유지를 위한 예산',
      [BudgetCategory.INDUSTRY_SME_ENERGY]: '산업 발전, 중소기업 지원, 에너지 정책 추진을 위한 예산',
      [BudgetCategory.RND]: '과학기술 연구 개발 및 혁신을 위한 예산',
      [BudgetCategory.SOC]: '도로, 철도, 항만 등 사회간접자본 확충을 위한 예산',
      [BudgetCategory.AGRICULTURE_FISHERY_FOOD]: '농업, 임업, 수산업 발전 및 식품 안전을 위한 예산',
      [BudgetCategory.PUBLIC_ORDER_SAFETY]: '경찰, 소방, 재난관리 등 공공 안전을 위한 예산',
      [BudgetCategory.ENVIRONMENT]: '환경 보호 및 기후변화 대응을 위한 예산',
      [BudgetCategory.CULTURE_SPORTS_TOURISM]: '문화 예술, 체육 진흥, 관광 산업 발전을 위한 예산',
      [BudgetCategory.DIPLOMACY_UNIFICATION]: '외교 정책 추진 및 남북 통일 준비를 위한 예산'
    };
    return descriptions[category] || '설명이 없습니다.';
  }
}
interface AdminBalance {
  currentBalance: number;
}

interface Prize {
  value: number;
  type: 'classic' | 'magic' | 'gold';
  name: string;
}

export class PrizeVerification {
  private adminBalance: AdminBalance = { currentBalance: 0 };
  private maxPrize: number;

  constructor(maxPrize: number) {
    this.maxPrize = maxPrize;
  }

  // Mettre à jour le solde administratif
  public updateAdminBalance(newBalance: number): void {
    this.adminBalance.currentBalance = newBalance;
  }

  // Vérifier si un gain peut être autorisé
  public canAuthorizePrize(prize: Prize): boolean {
    const requiredBalance = prize.value * 4;
    return this.adminBalance.currentBalance >= requiredBalance;
  }

  // Calculer le solde minimum requis pour un prix
  public getRequiredBalance(prize: Prize): number {
    return prize.value * 4;
  }

  // Réserver le montant du prix si autorisé
  public reservePrizeAmount(prize: Prize): boolean {
    if (this.canAuthorizePrize(prize)) {
      this.adminBalance.currentBalance -= prize.value;
      return true;
    }
    return false;
  }

  public generatePrizes(count: number, betAmount: number): number[] {
    const prizes: number[] = [];
    for (let i = 0; i < count; i++) {
      // Générer un prix entre 2x et 10x la mise, plafonné au prix maximum
      const multiplier = Math.random() * 8 + 2; // Entre 2 et 10
      const prize = Math.min(Math.floor(betAmount * multiplier), this.maxPrize);
      prizes.push(prize);
    }
    return prizes;
  }
}

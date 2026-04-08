// Mock data para desenvolvimento sem backend
export const mockData = {
  user: {
    id: 1,
    name: 'Giulia Marques',
    email: 'ruivagiulia@gmail.com',
    role: 'admin',
    company: 'Acqua X do Brasil',
  },

  financialSummary: {
    receivable: 125000,
    payable: 78000,
    totalRevenue: 450000,
    totalExpenses: 320000,
    receivableCount: 45,
    payableCount: 32,
    overdue: 15000,
    thisWeek: 25000,
    paidThisMonth: 89000,
    paidCount: 23,
  },

  crmStats: {
    total: 127,
    activeLeads: 45,
    inNegotiation: 12,
    closedThisMonth: 8,
    totalValue: 450000,
    newClients: 15,
  },

  projectsStats: {
    total: 24,
    inProgress: 15,
    completed: 7,
    delayed: 2,
    completedThisMonth: 3,
  },

  accounts: [],
  leads: [],
  projects: [],
}

export const useMockData = true // Set to false quando tiver backend

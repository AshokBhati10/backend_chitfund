/**
 * Mock Member Data
 * Structure: {name, medical, salary, withdrawals, risk}
 */

const mockMembers = [
  {
    id: 1,
    name: 'Ravi',
    medical: true,
    salary: false,
    withdrawals: true,
    risk: 0.2,
  },
  {
    id: 2,
    name: 'Amit',
    medical: false,
    salary: true,
    withdrawals: false,
    risk: 0.5,
  },
  {
    id: 3,
    name: 'Priya',
    medical: false,
    salary: true,
    withdrawals: true,
    risk: 0.3,
  },
  {
    id: 4,
    name: 'Vikram',
    medical: true,
    salary: true,
    withdrawals: false,
    risk: 0.4,
  },
  {
    id: 5,
    name: 'Neha',
    medical: false,
    salary: false,
    withdrawals: true,
    risk: 0.6,
  },
];

/**
 * Get all members (or simulate DB fetch)
 */
const getAllMembers = () => {
  return mockMembers;
};

/**
 * Get member by ID
 */
const getMemberById = (id) => {
  return mockMembers.find((member) => member.id === id);
};

module.exports = {
  mockMembers,
  getAllMembers,
  getMemberById,
};

export const INITIAL_COLS = {
  todo: { id: "todo", name: "Cần làm", items: [] },
  doing: { id: "doing", name: "Đang làm", items: [] },
  review: { id: "review", name: "Kiểm soát", items: [] },
  done: { id: "done", name: "Hoàn tất", items: [] }
};

export const formatCurrency = (amount, currency = 'VND') => {
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(amount);
  }
  
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND' 
  }).format(amount);
};
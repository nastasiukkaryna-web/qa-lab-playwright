const { test, expect } = require('@playwright/test'); 

test.describe('Фінальний набір тестів для AcademyBugs.com', () => { 

  // ТЕСТ #1: СОРТУВАННЯ ТОВАРІВ ЗА ЦІНОЮ
  test('Успішна зміна порядку відображення товарів за зростанням ціни', async ({ page }) => {
    // 1. Відкриваємо сторінку зі списком усіх товарів 
    await page.goto('https://academybugs.com/find-bugs/');

    // 2. Знаходимо селект за його ID та обираємо варіант за значенням "1"
    // Використовуємо ID, оскільки це найнадійніший локатор 
    const sortDropdown = page.locator('#sortfield');
    
    // Чекаємо на видимість елемента, щоб уникнути таймауту 
    await sortDropdown.waitFor({ state: 'visible' });
    
    // Обираємо "1" (Price Low-High), як вказано в HTML-коді сторінки
    await sortDropdown.selectOption('1');

    // 3. Дочекаємося оновлення списку товарів (networkidle чекає на завершення запитів)
    await page.waitForLoadState('networkidle');

    // Очікуваний результат: перевіряємо ціни перших двох товарів 
    const prices = await page.locator('.price .amount').allInnerTexts();
    
    if (prices.length >= 2) {
      // Перетворюємо рядки (напр. "$15.00") на числа для математичного порівняння 
      const numericPrices = prices.map(p => parseFloat(p.replace(/[^0-9.]/g, '')));
      
      // Перевіряємо, що перша ціна менша або дорівнює другій
      expect(numericPrices[0]).toBeLessThanOrEqual(numericPrices[1]);
    }
  });

  // ТЕСТ #2: РОБОТА ПОШУКОВОГО ФІЛЬТРА
  test('Успішна перевірка роботи пошукового фільтра', async ({ page }) => {
    // Відкриваємо сторінку магазину
    await page.goto('https://academybugs.com/store/all-items/');

    // Знаходимо поле пошуку в сайдбарі за атрибутом name [cite: 276]
    const searchField = page.locator('#secondary input[name="ec_search"]');
    await searchField.waitFor({ state: 'visible' });
    await searchField.fill('shoes');

    // Натискаємо кнопку пошуку в тому ж блоці
    await page.locator('#secondary input[type="submit"][value="Search"]').click();

    // 1. ЧЕКАЄМО, поки URL зміниться або з'явиться параметр пошуку (вирішує проблему в WebKit)
    await page.waitForURL(/.*ec_search=shoes/);
    
    // 2. Дочекаємося оновлення мережевої активності
    await page.waitForLoadState('networkidle');

    // 3. ЛОКАТОР: Використовуємо ID #ec_store_product_list, щоб ігнорувати бічну панель
    const productTitlesLocator = page.locator('#ec_store_product_list .ec_product_title_type1');
    
    // Додаткове очікування появи результатів на сторінці
    await productTitlesLocator.first().waitFor({ state: 'visible' });

    const productTitles = await productTitlesLocator.allTextContents();

    // Перевіряємо, що результати знайдено (кількість більше 0)
    expect(productTitles.length).toBeGreaterThan(0);

    // Перевіряємо відповідність кожного знайденого заголовка пошуковому запиту
    for (const title of productTitles) {
      expect(title.toLowerCase()).toContain('shoes');
    }
  });

}); 
const { test, expect } = require('@playwright/test');

test('Перевірка додавання товару в кошик (Silver Heart Bracelet)', async ({ page }) => {
    // Крок 1: Відкриваємо сторінку товару "Silver Heart Bracelet"
    // Додаємо networkidle, щоб переконатися, що всі скрипти кошика завантажилися
    await page.goto('https://academybugs.com/store/anchor-bracelet/', { waitUntil: 'networkidle' });

    // Крок 2: Натискаємо на кнопку "ADD TO CART"
    // Використовуємо Promise.all, щоб надійно обробити перехід на сторінку кошика
    await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle' }),
        page.getByRole('button', { name: 'ADD TO CART' }).click()
    ]);

    // Крок 3: Перевіряємо, що нас перекинуло на сторінку кошика
    await expect(page).toHaveURL(/.*my-cart/);

    // Крок 4: Перевіряємо наявність товару в кошику
    // Використовуємо точне ім'я (exact: true), щоб уникнути помилок з іншими схожими товарами
    const productInCart = page.getByRole('link', { name: 'Silver Heart Bracelet', exact: true });
    
    // Чекаємо видимості елемента, оскільки кошик може рендеритися секунду-дві
    await productInCart.waitFor({ state: 'visible', timeout: 5000 });
    await expect(productInCart).toBeVisible();
});
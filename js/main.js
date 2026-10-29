document.addEventListener('DOMContentLoaded', () => {
  const feeForm = document.getElementById('feeForm');
  const contactForm = document.getElementById('contactForm');
  const calcBtn = document.getElementById('calcBtn');
  const requestBookingBtn = document.getElementById('requestBookingBtn');
  const bookingSuccess = document.getElementById('bookingSuccess');
  const summaryBody = document.getElementById('summaryTableBody');
  const subtotalOutput = document.getElementById('subtotal');
  const discountOutput = document.getElementById('discount');
  const vatOutput = document.getElementById('vat');
  const totalOutput = document.getElementById('total');
  const clickableCards = document.querySelectorAll('.card-link');

  const setFieldError = (fieldId, message) => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.classList.toggle('invalid', !!message);
      field.setAttribute('aria-invalid', String(!!message));
    }

    const errorBox = document.querySelector(`[data-error-for="${fieldId}"]`);
    if (errorBox) {
      errorBox.textContent = message || '';
      errorBox.classList.toggle('visible', !!message);
    }
  };

  const clearFieldError = (fieldId) => setFieldError(fieldId, '');

  const currencyFormatter = new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
  });

  const getSelectedPackageAndExperienceItems = () => {
    const selected = Array.from(document.querySelectorAll('input[name="package"]:checked, input[name="experience"]:checked')).map((checkbox) => {
      const label = checkbox.closest('label');
      const labelText = label ? label.textContent.replace(/\s+/g, ' ').trim() : checkbox.value;
      const price = Number(checkbox.value) || 0;

      return {
        name: labelText,
        price,
        type: checkbox.name,
      };
    });

    return selected;
  };

  const getSelectedAddons = () => {
    return Array.from(document.querySelectorAll('input[name="addon"]:checked')).map((checkbox) => {
      const label = checkbox.closest('label');
      const labelText = label ? label.textContent.replace(/\s+/g, ' ').trim() : checkbox.value;

      return {
        name: labelText,
        price: Number(checkbox.value) || 0,
        type: checkbox.name,
      };
    });
  };

  const getSelectedItems = () => [...getSelectedPackageAndExperienceItems(), ...getSelectedAddons()];

  const getDiscountRate = (count) => {
    if (count > 3) return 0.15;
    if (count === 3) return 0.1;
    if (count === 2) return 0.05;
    return 0;
  };

  const formatCurrency = (value) => currencyFormatter.format(Number(value || 0));

  const validateForm = () => {
    const fullName = document.getElementById('fullName')?.value.trim() || '';
    const phone = document.getElementById('phone')?.value.trim() || '';
    const email = document.getElementById('email')?.value.trim() || '';
    const guestCount = Number(document.getElementById('guests')?.value || 0);
    const selectedPackageItems = getSelectedPackageAndExperienceItems();

    let isValid = true;

    clearFieldError('fullName');
    clearFieldError('phone');
    clearFieldError('email');
    clearFieldError('guests');
    const packageSelectionError = document.querySelector('[data-error-for="packageSelection"]');
    if (packageSelectionError) {
      packageSelectionError.textContent = '';
      packageSelectionError.classList.remove('visible');
    }

    if (!fullName) {
      setFieldError('fullName', 'Please enter your full name.');
      isValid = false;
    }

    const normalizedPhone = phone.replace(/\D/g, '');
    if (!phone) {
      setFieldError('phone', 'Please enter your phone number.');
      isValid = false;
    } else if (normalizedPhone.length < 10) {
      setFieldError('phone', 'Phone number must contain at least 10 digits.');
      isValid = false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setFieldError('email', 'Please enter your email address.');
      isValid = false;
    } else if (!emailPattern.test(email)) {
      setFieldError('email', 'Enter a valid email in the format name@domain.com.');
      isValid = false;
    }

    if (guestCount < 1) {
      setFieldError('guests', 'Guest count must be at least 1.');
      isValid = false;
    }

    if (selectedPackageItems.length === 0) {
      if (packageSelectionError) {
        packageSelectionError.textContent = 'Please select at least one package or experience.';
        packageSelectionError.classList.add('visible');
      }
      isValid = false;
    }

    return isValid;
  };

  const populateSummaryTable = (items, subtotal, discountAmount, vatAmount, totalAmount) => {
    if (!summaryBody) return;

    summaryBody.innerHTML = '';

    items.forEach((item) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${item.name}</td>
        <td>${item.type}</td>
        <td>${formatCurrency(item.price)}</td>
      `;
      summaryBody.appendChild(row);
    });

    if (subtotalOutput) subtotalOutput.textContent = formatCurrency(subtotal);
    if (discountOutput) discountOutput.textContent = formatCurrency(discountAmount);
    if (vatOutput) vatOutput.textContent = formatCurrency(vatAmount);
    if (totalOutput) totalOutput.textContent = formatCurrency(totalAmount);
  };

  const calculateTotal = () => {
    if (!validateForm()) {
      return;
    }

    const selectedPackageItems = getSelectedPackageAndExperienceItems();
    const selectedItems = getSelectedItems();
    const subtotal = selectedItems.reduce((sum, item) => sum + Number(item.price || 0), 0);
    const discountRate = getDiscountRate(selectedPackageItems.length);
    const discountAmount = subtotal * discountRate;
    const discountedSubtotal = subtotal - discountAmount;
    const vatAmount = discountedSubtotal * 0.15;
    const totalAmount = discountedSubtotal + vatAmount;

    populateSummaryTable(selectedItems, subtotal, discountAmount, vatAmount, totalAmount);
  };

  if (calcBtn) {
    calcBtn.addEventListener('click', calculateTotal);
  }

  if (requestBookingBtn) {
    requestBookingBtn.addEventListener('click', () => {
      if (!validateForm()) {
        return;
      }

      if (bookingSuccess) {
        bookingSuccess.textContent = 'Your booking request has been sent successfully. Our team will contact you shortly.';
        bookingSuccess.classList.add('visible');
      }
    });
  }

  if (feeForm) {
    feeForm.addEventListener('submit', (event) => {
      event.preventDefault();
      calculateTotal();
    });
  }

  if (contactForm) {
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const successMessage = document.getElementById('contactSuccess');

    const validateContactForm = () => {
      let isValid = true;

      const name = document.getElementById('c-name')?.value.trim() || '';
      const email = document.getElementById('c-email')?.value.trim() || '';
      const phone = document.getElementById('c-phone')?.value.trim() || '';
      const packageSelection = document.getElementById('c-package')?.value || '';
      const message = document.getElementById('c-message')?.value.trim() || '';

      setFieldError('c-name', '');
      setFieldError('c-email', '');
      setFieldError('c-phone', '');
      setFieldError('c-package', '');
      setFieldError('c-message', '');
      if (successMessage) {
        successMessage.textContent = '';
        successMessage.classList.remove('visible');
      }

      if (!name) {
        setFieldError('c-name', 'Please enter your name.');
        isValid = false;
      }

      if (!email) {
        setFieldError('c-email', 'Please enter your email address.');
        isValid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setFieldError('c-email', 'Please enter a valid email address.');
        isValid = false;
      }

      const normalizedPhone = phone.replace(/\D/g, '');
      if (!phone) {
        setFieldError('c-phone', 'Please enter your phone number.');
        isValid = false;
      } else if (normalizedPhone.length < 10) {
        setFieldError('c-phone', 'Phone number must contain at least 10 digits.');
        isValid = false;
      }

      if (!packageSelection) {
        setFieldError('c-package', 'Please select a package or experience.');
        isValid = false;
      }

      if (!message) {
        setFieldError('c-message', 'Please add a message so we know how we can help.');
        isValid = false;
      }

      return isValid;
    };

    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!validateContactForm()) {
        return;
      }

      if (successMessage) {
        successMessage.textContent = 'Thanks! Your message has been sent successfully.';
        successMessage.classList.add('visible');
      }

      contactForm.reset();
    });

    if (submitButton) {
      submitButton.addEventListener('click', () => {
        validateContactForm();
      });
    }
  }

  clickableCards.forEach((card) => {
    const goToCard = () => {
      const destination = card.dataset.href;
      if (destination) {
        window.location.href = destination;
      }
    };

    card.addEventListener('click', (event) => {
      if (event.target.closest('.btn')) {
        return;
      }

      goToCard();
    });

    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        goToCard();
      }
    });
  });

  populateSummaryTable([], 0, 0, 0, 0);
});

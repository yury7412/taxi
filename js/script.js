 jQuery.noConflict();
(function($) {
    $(document).ready(function() {
        // Функция для форматирования адреса
        function formatAddress(suggestion) {
            var data = suggestion.data;
            var result = suggestion.value;
            
            if (data.city || data.settlement) {
                result = (data.city || data.settlement) + ', ';
                if (data.street) result += data.street;
                if (data.house) result += ', ' + data.house;
                if (data.flat) result += ', кв. ' + data.flat;
                if (data.block) result += ', корп. ' + data.block;
            }
            
            return result;
        }

         $("#cityFrom").suggestions({
        token: "2ca423f90d51a7825cab5f07efdbf16f37c589f5", // замените на свой токен
        type: "ADDRESS",
        count: 5,
        minChars: 3, // минимальное количество символов для показа подсказок
        onSelect: function(suggestion) {
            console.log("Выбрано место отправления:", suggestion.value);
        }
    });
    
    // Инициализация для поля "Куда"
    $("#cityTo").suggestions({
        token: "2ca423f90d51a7825cab5f07efdbf16f37c589f5", // замените на свой токен
        type: "ADDRESS",
        count: 5,
        minChars: 3,
        onSelect: function(suggestion) {
            console.log("Выбрано место назначения:", suggestion.value);
        }
    });
    });
})(jQuery);
        let myMap;
        let route;

        function toggleServices() {
            const servicesSelect = document.getElementById('services');
            const toggleButton = document.getElementById('toggleServicesButton');

            if (servicesSelect.style.display === 'none') {
                servicesSelect.style.display = 'block';
                toggleButton.textContent = ''; // Скрыть текст кнопки
            } else {
                servicesSelect.style.display = 'none';
                toggleButton.textContent = 'Выбрать дополнительные услуги'; // Вернуть текст
            }
        }   

        function calculateCost() {
            var cityFrom = document.getElementById('cityFrom').value.trim();
            var cityTo = document.getElementById('cityTo').value.trim();
            var tariff = parseFloat(document.getElementById('tariff').value);
            var selectedServices = Array.from(document.getElementById('services').selectedOptions).map(option => parseFloat(option.value));

            if (!cityFrom || !cityTo) {
                alert("Пожалуйста, заполните все поля.");
                return;
            }

            ymaps.ready(function () {
                var geocoderFrom = ymaps.geocode(cityFrom);
                var geocoderTo = ymaps.geocode(cityTo);

                Promise.all([geocoderFrom, geocoderTo]).then(function (res) {
                    if (res[0].geoObjects.getLength() === 0 || res[1].geoObjects.getLength() === 0) {
                        alert('Не удалось найти указанные города. Проверьте правильность ввода.');
                        return;
                    }

                    var coordsFrom = res[0].geoObjects.get(0).geometry.getCoordinates();
                    var coordsTo = res[1].geoObjects.get(0).geometry.getCoordinates();

                    ymaps.route([coordsFrom, coordsTo]).then(function (route) {
                        if (!route) {
                            alert('Не удалось построить маршрут между указанными точками.');
                            return;
                        }

                        var distance = route.getLength() / 1000;
                        var baseCost = distance * tariff;

                        var servicesCost = selectedServices.reduce((sum, cost) => sum + cost, 0);

                        var totalCost = baseCost + servicesCost;

                        document.getElementById('result').innerText = `Стоимость поездки: ${totalCost.toFixed(2)} руб (Расстояние: ${distance.toFixed(2)} км)`;

                        document.getElementById('map').style.display = 'block';

                        if (myMap) {
                            myMap.destroy();
                        }

                        myMap = new ymaps.Map("map", {
                            center: coordsFrom,
                            zoom: 10
                        });

                        myMap.geoObjects.add(route.getPaths());
                    }).catch(function (error) {
                        alert('Ошибка при построении маршрута: ' + error.message);
                    });
                }).catch(function (error) {
                    alert('Ошибка при геокодировании: ' + error.message);
                });
            });
        }
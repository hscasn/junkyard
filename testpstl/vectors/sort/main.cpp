#include <iostream>
#include <stdlib.h>
#include <stdint.h>
#include <functional>

#include "timer.h"

#include "tbb/tbb.h"
#include "pstl/execution"
#include "pstl/algorithm"

#define ARRSZ 100000000

typedef uint16_t mytype;

template<class T>
void pvec(std::vector<mytype>& a, T& sorter)
{
	Timer t;
	t.start();
	std::sort(
		std::execution::par_unseq,
		a.begin(),
		a.end(),
		sorter
	);
	t.stop();

	size_t sum = 0;
	for (size_t i = 0; i < ARRSZ; i++) sum += a[i];
	std::cout << "Sum: " << sum << std::endl;

	std::cout << "Time for vector parallel vectorized sort: " << t << std::endl << std::endl;
}

template<class T>
void vec(std::vector<mytype>& a, T& sorter)
{
	Timer t;
	t.start();
	std::sort(
		std::execution::unseq,
		a.begin(),
		a.end(),
		sorter
	);
	t.stop();

	size_t sum = 0;
	for (size_t i = 0; i < ARRSZ; i++) sum += a[i];
	std::cout << "Sum: " << sum << std::endl;

	std::cout << "Time for vector vectorized sort: " << t << std::endl << std::endl;
}

template<class T>
void par(std::vector<mytype>& a, T& sorter)
{
	Timer t;
	t.start();
	std::sort(
		std::execution::par,
		a.begin(),
		a.end(),
		sorter
	);
	t.stop();

	size_t sum = 0;
	for (size_t i = 0; i < ARRSZ; i++) sum += a[i];
	std::cout << "Sum: " << sum << std::endl;

	std::cout << "Time for vector parallel sort: " << t << std::endl << std::endl;
}

template<class T>
void serial(std::vector<mytype>& a, T& sorter)
{
	Timer t;

	t.start();
	std::sort(
		std::execution::seq,
		a.begin(),
		a.end(),
		sorter
	);
	t.stop();

	size_t sum = 0;
	for (size_t i = 0; i < ARRSZ; i++) sum += a[i];
	std::cout << "Sum: " << sum << std::endl;

	std::cout << "Time for vector serial sort: " << t << std::endl << std::endl;
}

void refill(std::vector<mytype>& a) {
	srand(1);
	a.clear();
	for (size_t i = 0; i < ARRSZ; i++)
		a.push_back(rand());
}


int main()
{
	std::vector<mytype> a;

	auto sorter = [](mytype a, mytype b) { return a < b; };

	for (size_t i = 0; i < 3; i++) {
		std::cout << "==========" << std::endl;
		std::cout << "PASS " << i + 1 << std::endl;
		std::cout << "==========" << std::endl;

		refill(a);
		serial<decltype(sorter)>(a, sorter);
		refill(a);
		par<decltype(sorter)>(a, sorter);
		refill(a);
		vec<decltype(sorter)>(a, sorter);
		refill(a);
		pvec<decltype(sorter)>(a, sorter);
	}

	getchar();
	return 0;
}


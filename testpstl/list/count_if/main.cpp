#include <iostream>
#include <stdlib.h>
#include <stdint.h>
#include <functional>

#include "timer.h"

#include "tbb/tbb.h"
#include "pstl/execution"
#include "pstl/algorithm"

#define ARRSZ 80000000

typedef uint16_t mytype;

template<class T>
void pvec(std::list<mytype>& a, T& condition)
{
	Timer t;
	t.start();
	size_t sum = std::count_if(
		std::execution::par_unseq,
		a.begin(),
		a.end(),
		condition
	);
	t.stop();

	std::cout << "Sum: " << sum << std::endl;

	std::cout << "Time for list parallel vectorized count_if: " << t << std::endl << std::endl;
}

template<class T>
void vec(std::list<mytype>& a, T& condition)
{
	Timer t;
	t.start();
	size_t sum = std::count_if(
		std::execution::unseq,
		a.begin(),
		a.end(),
		condition
	);
	t.stop();

	std::cout << "Sum: " << sum << std::endl;

	std::cout << "Time for list vectorized count_if: " << t << std::endl << std::endl;
}

template<class T>
void par(std::list<mytype>& a, T& condition)
{
	Timer t;
	t.start();
	size_t sum = std::count_if(
		std::execution::par,
		a.begin(),
		a.end(),
		condition
	);
	t.stop();

	std::cout << "Sum: " << sum << std::endl;

	std::cout << "Time for list parallel count_if: " << t << std::endl << std::endl;
}

template<class T>
void serial(std::list<mytype>& a, T& condition)
{
	Timer t;
	t.start();
	size_t sum = std::count_if(
		std::execution::seq,
		a.begin(),
		a.end(),
		condition
	);
	t.stop();

	std::cout << "Sum: " << sum << std::endl;

	std::cout << "Time for list serial count_if: " << t << std::endl << std::endl;
}


int main()
{
	srand(1);

	std::list<mytype> a;

	for (size_t i = 0; i < ARRSZ; i++)
		a.push_back(rand());

	auto condition = [](mytype& i) { return i % 3 == 0; };

	for (size_t i = 0; i < 3; i++) {
		std::cout << "==========" << std::endl;
		std::cout << "PASS " << i + 1 << std::endl;
		std::cout << "==========" << std::endl;

		serial<decltype(condition)>(a, condition);
		par<decltype(condition)>(a, condition);
		vec<decltype(condition)>(a, condition);
		pvec<decltype(condition)>(a, condition);
	}

	getchar();
	return 0;
}


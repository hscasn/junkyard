#include <iostream>
#include <stdlib.h>
#include <stdint.h>
#include <functional>

#include "timer.h"

#include "tbb/tbb.h"
#include "pstl/execution"
#include "pstl/algorithm"

#define ARRSZ 200000000

typedef uint16_t mytype;

template<class T>
void pvec(std::vector<mytype>& a, T& action)
{

	size_t sum = 0;
	for (size_t i = 0; i < ARRSZ; i++) sum += a[i];
	std::cout << "Sum before: " << sum << std::endl;

	Timer t;
	t.start();
	std::transform(
		std::execution::par_unseq,
		a.begin(),
		a.end(),
		a.begin(),
		action
	);
	t.stop();

	sum = 0;
	for (size_t i = 0; i < ARRSZ; i++) sum += a[i];
	std::cout << "Sum: " << sum << std::endl;

	std::cout << "Time for vector parallel vectorized transform: " << t << std::endl << std::endl;
}

template<class T>
void vec(std::vector<mytype>& a, T& action)
{

	size_t sum = 0;
	for (size_t i = 0; i < ARRSZ; i++) sum += a[i];
	std::cout << "Sum before: " << sum << std::endl;

	Timer t;
	t.start();
	std::transform(
		std::execution::unseq,
		a.begin(),
		a.end(),
		a.begin(),
		action
	);
	t.stop();

	sum = 0;
	for (size_t i = 0; i < ARRSZ; i++) sum += a[i];
	std::cout << "Sum: " << sum << std::endl;

	std::cout << "Time for vector vectorized transform: " << t << std::endl << std::endl;
}

template<class T>
void par(std::vector<mytype>& a, T& action)
{

	size_t sum = 0;
	for (size_t i = 0; i < ARRSZ; i++) sum += a[i];
	std::cout << "Sum before: " << sum << std::endl;

	Timer t;
	t.start();
	std::transform(
		std::execution::par,
		a.begin(),
		a.end(),
		a.begin(),
		action
	);
	t.stop();

	sum = 0;
	for (size_t i = 0; i < ARRSZ; i++) sum += a[i];
	std::cout << "Sum: " << sum << std::endl;

	std::cout << "Time for vector parallel transform: " << t << std::endl << std::endl;
}

template<class T>
void serial(std::vector<mytype>& a, T& action)
{

	size_t sum = 0;
	for (size_t i = 0; i < ARRSZ; i++) sum += a[i];
	std::cout << "Sum before: " << sum << std::endl;

	Timer t;
	t.start();
	std::transform(
		std::execution::seq,
		a.begin(),
		a.end(),
		a.begin(),
		action
	);
	t.stop();

	sum = 0;
	for (size_t i = 0; i < ARRSZ; i++) sum += a[i];
	std::cout << "Sum: " << sum << std::endl;

	std::cout << "Time for vector serial transform: " << t << std::endl << std::endl;
}


int main()
{
	srand(1);

	std::vector<mytype> a;

	for (size_t i = 0; i < ARRSZ; i++)
		a.push_back(rand());

	auto action = [](mytype i) { return i += 5; };

	for (size_t i = 0; i < 3; i++) {
		std::cout << "==========" << std::endl;
		std::cout << "PASS " << i + 1 << std::endl;
		std::cout << "==========" << std::endl;

		serial<decltype(action)>(a, action);
		par<decltype(action)>(a, action);
		vec<decltype(action)>(a, action);
		pvec<decltype(action)>(a, action);
	}

	getchar();
	return 0;
}


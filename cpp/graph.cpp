

#include <iostream>
#include <sstream>
#include <vector>
#include <algorithm>

using std::vector;
using std::stringstream;

using Val = float;

char buf[1 << 20];

struct Poly {
    vector<Val> coff;
    Poly(size_t n) : coff(vector<Val>(n)) {}
    Poly(size_t n, std::initializer_list<Val> list) {
        coff = vector<Val>(n);
        size_t i = 0;
        for (auto v : list) {
            coff[i++] = v;
        }
    }

     Poly operator*(const Poly& other) const {
        size_t n = coff.size();
        Poly result(n);
        for (size_t i = 0; i < n; ++i) {
            for (size_t j = 0; j <= i; ++j) {
                result.coff[i] += other.coff[j] * coff[i - j];
            }
        }
        return result;
    }

    Poly operator/(Val v) const {
        size_t n = coff.size();
        Poly result(n);
        for (size_t i = 0; i < n; ++i) {
            result.coff[i] = coff[i] / v;
        }
        return result;
    }

    Poly operator*(Val v) const {
        size_t n = coff.size();
        Poly result(n);
        for (size_t i = 0; i < n; ++i) {
            result.coff[i] = coff[i] * v;
        }
        return result;
    }

    Poly operator+(const Poly& other) const {
        size_t n = coff.size();
        Poly result(n);
        for (size_t i = 0; i < n; ++i) {
            result.coff[i] = coff[i] + other.coff[i];
        }
        return result;
    }

     Poly operator-(const Poly& other) const {
        size_t n = coff.size();
        Poly result(n);
        for (size_t i = 0; i < n; ++i) {
            result.coff[i] = coff[i] - other.coff[i];
        }
        return result;
    }


};

Val perm_sign(const vector<size_t>& perm) {

    Val sign = 1;

    for (size_t i = 0; i < perm.size(); ++i) {
        for (size_t j = 0; j < i; ++j) {
            if (perm[j] > perm[i]) sign *= -1;
        }
    }

    return sign;
}

extern "C" const char* characteristic(const char* graph) {
    stringstream stream(graph);
    size_t n;
    stream >> n;
    vector<Poly> mat(n * n, Poly(n + 1));
    for (size_t i = 0; i < n * n; ++i) {
        stream >> mat[i].coff[0];
    }

    for (size_t i = 0; i < n; ++i) {
        mat[i * n + i].coff[1] -= 1;
    }

    vector<size_t> perm(n);
    std::generate(perm.begin(), perm.end(), [x = 0]() mutable { return x++; });

    Poly det(n + 1);

    do {
        Poly prod(n + 1, {perm_sign(perm)});
        for (size_t i = 0; i < n; ++i) {
            prod = prod * mat[i * n + perm[i]];
        }
        det = det + prod;
    } while (std::next_permutation(perm.begin(), perm.end()));

    memset(buf, 0, sizeof(buf));
    stringstream outstream;
    outstream << "[";
    for (size_t i = 0; i < det.coff.size(); ++i) {
        outstream << det.coff[i];
        if (i < n) outstream << ',';
    }
    outstream << "]";
    strcpy(buf, outstream.str().c_str());
    return buf;
}


extern "C" const char* checkIsomorphism(const char* graph_data) {
    std::stringstream stream(graph_data);
    size_t n;
    stream >> n;
    vector<size_t> graph1(n * n), graph2(n * n);
    for (size_t i = 0; i < n * n; ++i) {
        stream >> graph1[i];
    }
    for (size_t i = 0; i < n * n; ++i) {
        stream >> graph2[i];
    }

    vector<size_t> map(n);
    std::generate(map.begin(), map.end(), [x = 0]() mutable { return x++; });

    bool have = false;

    do {
        bool ok = true;
        for (size_t i = 0; i < n && ok; ++i) {
            for (size_t j = 0; j < n; ++j) {
                if (graph1[i * n + j] != graph2[map[i] * n + map[j]]) {
                    ok = false;
                    break;
                }
            }
        }
        if (ok) {
            have = true;
            break;
        }
    } while (std::next_permutation(map.begin(), map.end()));
    
    memset(buf, 0, sizeof(buf));
    if (have) {
        stringstream outstream;
        outstream << "[";
        for (size_t i = 0; i < n; ++i) {
            outstream << map[i];
            if (i < n - 1) outstream << ',';
        }
        outstream << "]";
        strcpy(buf, outstream.str().c_str());
    }
    return buf;
}
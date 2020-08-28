delta = cell(nl + 1, 1);
Delta = cell(nl, 1);
ThetaGrad  =  cell(nl, 1);
grad = zeros(snel(end), 1);

delta{nl+1} = h_nn - y_nn;
Delta{nl} = delta{nl+1}' * a{nl}; % dimensions: s(bi) x (s(bi-1) + 1)
ThetaGrad{nl} = Delta{nl}/m + [zeros(layers(nl+1), 1) Theta{nl}(:, 2:end)]*lambda/m;
grad((snel(nl)+1):snel(nl+1)) = ThetaGrad{nl}(:);

for ii = 2:nl
    bi = nl - ii + 2;
    delta{bi} = (delta{bi + 1} * Theta{bi}(:, 2:end)) .* gF(z{bi});
    Delta{bi-1} = delta{bi}' * a{bi-1};
    ThetaGrad{bi-1} = Delta{bi-1}/m + [zeros(layers(bi), 1) Theta{bi-1}(:, 2:end)]*lambda/m;
    grad((snel(bi - 1)+1):snel(bi)) = ThetaGrad{bi-1}(:);
end
end
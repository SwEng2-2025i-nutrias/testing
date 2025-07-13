from pytest import mark

@mark.unit
def test_unit():
    assert True

@mark.unit
def test_unit_failure():
    assert False, "This test is expected to fail"